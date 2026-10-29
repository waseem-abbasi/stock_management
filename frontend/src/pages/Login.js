import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Container, Row, Col, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const Login = () => {
  const [email, setEmail] = useState('admin@stock.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code & New Password, 3: Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessNotice, setForgotSuccessNotice] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify your credentials and database connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setSuccessNotice('');
  };

  // Open Forgot Password Modal
  const handleOpenForgot = () => {
    setForgotEmail(email || '');
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotStep(1);
    setShowForgotModal(true);
  };

  const handleCloseForgot = () => {
    setShowForgotModal(false);
  };

  // Step 1: Send verification code
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await axiosClient.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.success) {
        setForgotCode('');
        setForgotStep(2);
      }
    } catch (err) {
      setForgotError(
        err.response?.data?.message || 'Failed to request reset code. Please check your email address.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Submit new password
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await axiosClient.post('/auth/reset-password', {
        email: forgotEmail,
        code: forgotCode,
        newPassword: forgotNewPassword,
      });

      if (res.data.success) {
        setForgotStep(3);
        // Pre-fill login credentials with the newly updated password
        setEmail(forgotEmail);
        setPassword(forgotNewPassword);
        setSuccessNotice('Your password has been reset successfully! You can now log in.');
      }
    } catch (err) {
      setForgotError(
        err.response?.data?.message || 'Failed to reset password. Please verify the code.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  // Resend verification code in Step 2
  const handleResendCode = async () => {
    setForgotError('');
    setForgotLoading(true);

    try {
      await axiosClient.post('/auth/forgot-password', { email: forgotEmail });
      setForgotCode('');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleFinishReset = () => {
    setShowForgotModal(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={7} lg={5} xl={4}>
            <div className="text-center mb-4">
              {/* <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
                <i className="bi bi-box-seam-fill fs-1"></i>
              </div> */}
              <h2 className="fw-bold text-dark">StockMaster</h2>
            </div>

            <Card className="border-0 shadow-sm rounded-4 p-4">
              <Card.Body>
                <h4 className="fw-bold mb-3 text-dark">Sign In</h4>
                <p className="text-secondary small mb-4">Enter your credentials to manage inventory</p>

                {successNotice && (
                  <Alert variant="success" className="py-2 small" onClose={() => setSuccessNotice('')} dismissible>
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {successNotice}
                  </Alert>
                )}

                {error && (
                  <Alert variant="danger" className="py-2 small">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label className="small fw-semibold text-secondary">Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="name@company.com"

                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="small fw-semibold text-secondary mb-0">Password</Form.Label>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none small text-primary fw-semibold"
                        style={{ fontSize: '0.82rem' }}
                        onClick={handleOpenForgot}
                      >
                        Forgot password?

                      </button>
                    </div>
                  
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        // value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="py-2"
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </Button>
                    </InputGroup>

                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-auto px-4 py-2 fw-semibold w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In to Dashboard'
                    )}
                  </Button>
                </Form>

                {/* <div className="mt-4 pt-3 border-top">
                  <div className="small text-muted mb-2 text-center">Quick Demo Credentials:</div>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="small"
                      onClick={() => handleQuickFill('waseemabbasi5111@gmail.com', 'admin123')}
                    >
                      Admin Account
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="small"
                      onClick={() => handleQuickFill('staff@stock.com', 'staff123')}
                    >
                      Staff Account
                    </Button>
                  </div>
                </div> */}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Forgot Password Modal */}
      <Modal show={showForgotModal} onHide={handleCloseForgot} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5 fw-bold text-dark d-flex align-items-center">
            <div className="p-2 rounded-circle bg-primary bg-opacity-10 text-primary me-2 d-inline-flex">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            Reset Password
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-2 px-4 pb-4">
          {forgotStep === 1 && (
            <div>
              <p className="text-secondary small mb-3">
                Enter your account email address. We'll generate a secure verification code to reset your password.
              </p>

              {forgotError && (
                <Alert variant="danger" className="py-2 small">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {forgotError}
                </Alert>
              )}

              <Form onSubmit={handleRequestResetCode}>
                <Form.Group className="mb-3" controlId="forgotFormEmail">
                  <Form.Label className="small fw-semibold text-secondary">Registered Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@company.com"
                    // value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="py-2"
                    autoFocus
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button variant="light" onClick={handleCloseForgot} disabled={forgotLoading}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={forgotLoading || !forgotEmail.trim()}>
                    {forgotLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Verifying...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          )}

          {forgotStep === 2 && (
            <div>
              <div className="alert alert-primary py-2 px-3 small border-0 d-flex align-items-center mb-3">
                <i className="bi bi-envelope-check-fill text-primary fs-5 me-2 flex-shrink-0"></i>
                <div>
                  A 6-digit verification code has been sent to <strong>{forgotEmail}</strong>. Please check your email inbox and enter the code below.
                </div>
              </div>

              {forgotSuccessNotice && (
                <Alert variant="info" className="py-2 small">
                  <i className="bi bi-info-circle me-2"></i>
                  {forgotSuccessNotice}
                </Alert>
              )}

              {forgotError && (
                <Alert variant="danger" className="py-2 small">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {forgotError}
                </Alert>
              )}

              <Form onSubmit={handleConfirmReset}>
                <Form.Group className="mb-3" controlId="forgotFormCode">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Form.Label className="small fw-semibold text-secondary mb-0">6-Digit Code</Form.Label>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-decoration-none small text-primary"
                      onClick={handleResendCode}
                      disabled={forgotLoading}
                    >
                      Resend Code
                    </Button>
                  </div>
                  <Form.Control
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    required
                    className="py-2 font-monospace fs-5 text-center"
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="forgotFormNewPassword">
                  <Form.Label className="small fw-semibold text-secondary">New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      required
                      className="py-2"
                    />
                    <Button
                      variant="outline-secondary"
                      className="px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      type="button"
                    >
                      <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4" controlId="forgotFormConfirmPassword">
                  <Form.Label className="small fw-semibold text-secondary">Confirm New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      required
                      className="py-2"
                    />
                    <Button
                      variant="outline-secondary"
                      className="px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      type="button"
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none small text-secondary"
                    onClick={() => setForgotStep(1)}
                  >
                    <i className="bi bi-arrow-left me-1"></i> Back
                  </Button>
                  <div className="d-flex gap-2">
                    <Button variant="light" onClick={handleCloseForgot} disabled={forgotLoading}>
                      Cancel
                    </Button>
                    <Button variant="success" type="submit" disabled={forgotLoading || !forgotCode || !forgotNewPassword || !forgotConfirmPassword}>
                      {forgotLoading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          )}

          {forgotStep === 3 && (
            <div className="text-center py-3">
              <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3">
                <i className="bi bi-check-circle-fill fs-1"></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">Password Reset Successful!</h5>
              <p className="text-muted small mb-4">
                Your new password has been saved. Your login form has been automatically updated.
              </p>
              <Button variant="primary" className="w-100 py-2 fw-semibold" onClick={handleFinishReset}>
                Sign In With New Password
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Login;
