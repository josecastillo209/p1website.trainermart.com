import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

// Create an account without automatically logging the user in.
export async function createAccount(req, res, next) {
  try {
    const body = req.body ?? {};
    const errors = {};

    // Only accept strings for these fields.
    const text = (value) =>
      typeof value === 'string' ? value.trim() : '';

    const username = text(body.username).toLowerCase();
    const firstName = text(body.firstName);
    const lastName = text(body.lastName);
    const email = text(body.email).toLowerCase();
    const password =
      typeof body.password === 'string' ? body.password : '';

    if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
      errors.username =
        'Username must be 3–30 letters, numbers, underscores, or hyphens.';
    }

    if (!firstName || firstName.length > 100) {
      errors.firstName = 'First name is required (maximum 100 characters).';
    }

    if (!lastName || lastName.length > 100) {
      errors.lastName = 'Last name is required (maximum 100 characters).';
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email = 'Enter a valid email address.';
    }

    // bcrypt supports passwords up to 72 bytes.
    if (
      password.length < 8 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      errors.password =
        'Password must be at least 8 characters and at most 72 bytes.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Please correct the highlighted fields.',
        errors,
      });
    }

    const users = req.app.locals.db.collection('users');

    const existing = await users.findOne({
      $or: [{ username }, { email }],
    });

    if (existing) {
      return res.status(409).json({
        message: 'That username or email is already registered.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await users.insertOne({
      username,
      firstName,
      lastName,
      email,
      passwordHash,
      phone: '',
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: 'Account created successfully. Please log in.',
    });
  } catch (error) {
    // Unique indexes also prevent duplicates from simultaneous requests.
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'That username or email is already registered.',
      });
    }

    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const body = req.body ?? {};
    const email =
      typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';
    const password =
      typeof body.password === 'string' ? body.password : '';

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !password ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      return res.status(400).json({
        message: 'Enter a valid email and password.',
      });
    }

    const users = req.app.locals.db.collection('users');
    const user = await users.findOne({ email });

    const validPassword =
      user && await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        message: 'Incorrect email or password.',
      });
    }

    // Keep the shopping cart when replacing the session at login.
    const cart = req.session.cart;

    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.userId = user._id.toString();

      if (cart !== undefined) {
        req.session.cart = cart;
      }

      req.session.save((error) => {
        if (error) return next(error);

        res.json({
          message: 'Logged in successfully.',
          account: {
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            shippingAddress: user.shippingAddress,
          },
        });
      });
    });
  } catch (error) {
    next(error);
  }
}

export async function getAccount(req, res, next) {
  try {
    const userId = req.session.userId;

    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(401).json({
        message: 'Please log in to view your account.',
      });
    }

    const user = await req.app.locals.db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return res.status(401).json({
        message: 'Account not found. Please log in again.',
      });
    }

    res.json({ account: user });
  } catch (error) {
    next(error);
  }
}

export function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie('trainermart.sid', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.json({ message: 'Logged out successfully.' });
  });
}

export async function updateAccount(req, res, next) {
  try {
    const userId = req.session.userId;

    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(401).json({
        message: 'Please log in to edit your account.',
      });
    }

    const body = req.body ?? {};
    const errors = {};
    const updates = {};

    // Only these fields can be changed. Never accept _id from the form.
    const textFields = [
      'username',
      'email',
      'firstName',
      'lastName',
      'phone',
    ];

    for (const field of textFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'string') {
          errors[field] = 'Must be text.';
        } else {
          updates[field] = body[field].trim();
        }
      }
    }

    if (updates.username !== undefined) {
      updates.username = updates.username.toLowerCase();

      if (!/^[a-z0-9_-]{3,30}$/.test(updates.username)) {
        errors.username =
          'Username must be 3–30 letters, numbers, underscores, or hyphens.';
      }
    }

    if (updates.email !== undefined) {
      updates.email = updates.email.toLowerCase();

      if (
        updates.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)
      ) {
        errors.email = 'Enter a valid email address.';
      }
    }

    for (const field of ['firstName', 'lastName']) {
      if (
        updates[field] !== undefined &&
        (!updates[field] || updates[field].length > 100)
      ) {
        errors[field] = 'Required; maximum 100 characters.';
      }
    }

    if (updates.phone !== undefined && updates.phone.length > 30) {
      errors.phone = 'Phone must be at most 30 characters.';
    }

    if (body.shippingAddress !== undefined) {
      const address = body.shippingAddress;
      const fields = ['street', 'city', 'state', 'zip'];

      if (
        !address ||
        typeof address !== 'object' ||
        Array.isArray(address)
      ) {
        errors.shippingAddress = 'Enter a valid shipping address.';
      } else {
        updates.shippingAddress = {};

        for (const field of fields) {
          const value =
            typeof address[field] === 'string'
              ? address[field].trim()
              : '';

          if (!value || value.length > 200) {
            errors[`shippingAddress.${field}`] =
              'Required; maximum 200 characters.';
          }

          updates.shippingAddress[field] = value;
        }
      }
    }

    const changingPassword =
      body.password !== undefined && body.password !== '';

    if (
      changingPassword &&
      (
        typeof body.password !== 'string' ||
        body.password.length < 8 ||
        Buffer.byteLength(body.password, 'utf8') > 72
      )
    ) {
      errors.password =
        'Password must be at least 8 characters and at most 72 bytes.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Please correct the highlighted fields.',
        errors,
      });
    }

    const users = req.app.locals.db.collection('users');
    const filter = { _id: new ObjectId(userId) };
    const user = await users.findOne(filter);

    if (!user) {
      return res.status(401).json({
        message: 'Account not found. Please log in again.',
      });
    }

    // Require the current password before changing the password.
    if (changingPassword) {
      const currentPassword = body.currentPassword;

      if (
        typeof currentPassword !== 'string' ||
        Buffer.byteLength(currentPassword, 'utf8') > 72 ||
        !await bcrypt.compare(currentPassword, user.passwordHash)
      ) {
        return res.status(400).json({
          message: 'Current password is incorrect.',
          errors: {
            currentPassword: 'Enter your current password.',
          },
        });
      }

      updates.passwordHash = await bcrypt.hash(body.password, 12);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'No account changes were provided.',
      });
    }

    updates.updatedAt = new Date();

    // Unique database indexes reject duplicate usernames and emails.
    await users.updateOne(filter, { $set: updates });

    const account = await users.findOne(
      filter,
      { projection: { passwordHash: 0 } }
    );

    res.json({
      message: 'Account updated successfully.',
      account,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'That username or email is already registered.',
      });
    }

    next(error);
  }
}