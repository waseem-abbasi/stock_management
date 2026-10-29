const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../utils/emailService');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const userResult = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    console.log("userresult",userResult)
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userAgent = req.headers['user-agent'] || '';
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ua: userAgent,
      },
      process.env.JWT_SECRET || 'super_secret_jwt_key_stock_management_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'staff' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name.trim(), email.trim().toLowerCase(), passwordHash, role === 'admin' ? 'admin' : 'staff']
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during user creation' });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const listUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('ListUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userResult = await db.query('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No registered user found with this email address.' });
    }

    const user = userResult.rows[0];
    // Generate a 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Clear old reset codes for this email
    await db.query('DELETE FROM password_resets WHERE LOWER(email) = LOWER($1)', [cleanEmail]);

    // Store new code
    await db.query(
      'INSERT INTO password_resets (user_id, email, reset_code, expires_at) VALUES ($1, $2, $3, $4)',
      [user.id, user.email, resetCode, expiresAt]
    );

    console.log(`[PASSWORD RESET] Code generated for ${user.email} (${user.name}): ${resetCode}`);

    // Send real email via nodemailer
    try {
      await sendPasswordResetEmail(user.email, user.name, resetCode);
    } catch (mailErr) {
      console.error('[PASSWORD RESET ERROR] Failed to deliver email:', mailErr.message);
      return res.status(500).json({
        success: false,
        message: `Failed to send email to ${user.email}. ${mailErr.message}. Please verify your EMAIL_USER and EMAIL_PASS in backend/.env.`,
      });
    }

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${user.email}. Please check your inbox and spam folder.`,
      email: user.email,
    });
  } catch (error) {
    console.error('ForgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to process forgot password request.' });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    const record = await db.query(
      'SELECT id FROM password_resets WHERE LOWER(email) = LOWER($1) AND reset_code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [cleanEmail, cleanCode]
    );

    if (record.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    res.json({ success: true, message: 'Verification code is valid.' });
  } catch (error) {
    console.error('VerifyResetCode error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify reset code.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, verification code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    const record = await db.query(
      'SELECT id FROM password_resets WHERE LOWER(email) = LOWER($1) AND reset_code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [cleanEmail, cleanCode]
    );

    if (record.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code. Please request a new code.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE LOWER(email) = LOWER($2)', [passwordHash, cleanEmail]);

    // Clean up reset codes
    await db.query('DELETE FROM password_resets WHERE LOWER(email) = LOWER($1)', [cleanEmail]);

    res.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('ResetPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  listUsers,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};
