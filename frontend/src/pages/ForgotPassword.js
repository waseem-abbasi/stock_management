import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Code & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessInfo('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setCode('');
        setSuccessInfo(res.data.message || 'Verification code sent to your email.');
        setStep(2);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to request password reset. Please check your email address.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/reset-password', {
        email,
        code,
        newPassword,
      });

      if (res.data.success) {
        setStep(3);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to reset password. Please verify the code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setCode('');
        setSuccessInfo(`A new 6-digit verification code has been sent to ${email}!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={7} lg={5} xl={4}>
            <div className="text-center mb-4">
              <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
                <i className="bi bi-shield-lock-fill fs-1"></i>
              </div>
              <h2 className="fw-bold text-dark">StockMaster</h2>
              <p className="text-muted small">Account Password Recovery</p>
            </div>

            <Card className="border-0 shadow-sm rounded-4 p-4">
              <Card.Body>
                {step === 1 && (
                  <>
                    <h4 className="fw-bold mb-2 text-dark">Forgot Password?</h4>
                    <p className="text-secondary small mb-4">
                      Enter your registered email address and we'll generate a verification code to reset your password.
                    </p>

                    {error && (
                      <Alert variant="danger" className="py-2 small">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleRequestCode}>
                      <Form.Group className="mb-4" controlId="resetEmail">
                        <Form.Label className="small fw-semibold text-secondary">Email address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="py-2"
                          autoFocus
                        />
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 py-2 fw-semibold mb-3"
                        disabled={loading || !email.trim()}
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                            Checking Email...
                          </>
                        ) : (
                          'Send Verification Code'
                        )}
                      </Button>

                      <div className="text-center">
                        <Link to="/login" className="text-decoration-none small text-secondary fw-semibold">
                          <i className="bi bi-arrow-left me-1"></i> Back to Sign In
                        </Link>
                      </div>
                    </Form>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h4 className="fw-bold mb-2 text-dark">Set New Password</h4>
                    
                    <div className="alert alert-primary py-2 px-3 small border-0 d-flex align-items-center mb-3">
                      <i className="bi bi-envelope-check-fill text-primary fs-5 me-2 flex-shrink-0"></i>
                      <div>
                        A 6-digit verification code has been sent to <strong>{email}</strong>. Please check your email inbox and enter the code below.
                      </div>
                    </div>

                    {successInfo && (
                      <Alert variant="info" className="py-2 small">
                        <i className="bi bi-info-circle me-2"></i>
                        {successInfo}
                      </Alert>
                    )}

                    {error && (
                      <Alert variant="danger" className="py-2 small">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleResetPassword}>
                      <Form.Group className="mb-3" controlId="verificationCode">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <Form.Label className="small fw-semibold text-secondary mb-0">6-Digit Code</Form.Label>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none small text-primary"
                            onClick={handleResendCode}
                            disabled={loading}
                          >
                            Resend Code
                          </Button>
                        </div>
                        <Form.Control
                          type="text"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          required
                          className="py-2 font-monospace fs-5 text-center letter-spacing"
                          autoFocus
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="newPassword">
                        <Form.Label className="small fw-semibold text-secondary">New Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            placeholder="At least 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="py-2"
                          />
                          <Button
                            variant="outline-secondary"
                            className="px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            type="button"
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </Button>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-4" controlId="confirmPassword">
                        <Form.Label className="small fw-semibold text-secondary">Confirm New Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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

                      <Button
                        variant="success"
                        type="submit"
                        className="w-100 py-2 fw-semibold mb-3"
                        disabled={loading || !code || !newPassword || !confirmPassword}
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                            Updating Password...
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </Button>

                      <div className="d-flex justify-content-between align-items-center">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-decoration-none small text-secondary p-0"
                          onClick={() => setStep(1)}
                        >
                          <i className="bi bi-arrow-left me-1"></i> Change Email
                        </Button>
                        <Link to="/login" className="text-decoration-none small text-secondary fw-semibold">
                          Back to Sign In
                        </Link>
                      </div>
                    </Form>
                  </>
                )}

                {step === 3 && (
                  <div className="text-center py-3">
                    <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3">
                      <i className="bi bi-check-circle-fill fs-1"></i>
                    </div>
                    <h4 className="fw-bold mb-2 text-dark">Password Changed!</h4>
                    <p className="text-muted small mb-4">
                      Your password has been successfully reset. You can now sign in with your new credentials.
                    </p>
                    <Button
                      variant="primary"
                      className="w-100 py-2 fw-semibold"
                      onClick={() => navigate('/login')}
                    >
                      Sign In Now
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            <div className="text-center mt-4 text-muted small">
              StockMaster &bull; Inventory Security System
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;
