import { motion, useReducedMotion } from "framer-motion";
import robotImageSrc from "../../assets/Finixa robot.png";
import AuthModal from "../../features/auth/components/welcome-auth/AuthModal";
import { useWelcomeAuthFlow } from "../../features/auth/hooks/useWelcomeAuthFlow";
import { heroBenefits } from "../../features/welcome/content";
import HeroSection from "../../features/welcome/components/HeroSection";
import StickyNavbar from "../../features/welcome/components/StickyNavbar";
import WelcomeContentSections from "../../features/welcome/components/WelcomeContentSections";
import { pageMotion } from "../../shared/animations/pageMotion";

export default function WelcomePage() {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const {
    authBanner,
    authMode,
    closeAuthModal,
    confirmationEmail,
    forgotPasswordData,
    forgotPasswordErrors,
    forgotPasswordMutation,
    handleForgotPasswordChange,
    handleForgotPasswordSubmit,
    handleLoginChange,
    handleLoginSubmit,
    handleRegisterChange,
    handleRegisterSubmit,
    isAuthOpen,
    loginData,
    loginErrors,
    loginMutation,
    openLoginModal,
    passwordResetEmail,
    registerData,
    registerErrors,
    registerMutation,
    switchToForgotPassword,
    switchToLogin,
    switchToSignup,
  } = useWelcomeAuthFlow();

  return (
    <motion.main
      variants={pageMotion.page(shouldReduceMotion)}
      initial="hidden"
      animate="visible"
      className="min-h-screen overflow-x-hidden bg-gradient-to-b from-white to-customBg"
    >
      <StickyNavbar />
      <HeroSection
        robotImageSrc={robotImageSrc}
        benefits={heroBenefits}
        onTryFree={openLoginModal}
      />
      <WelcomeContentSections onTryFree={openLoginModal} />
      <AuthModal
        isOpen={isAuthOpen}
        authMode={authMode}
        authBanner={authBanner}
        confirmationEmail={confirmationEmail}
        passwordResetEmail={passwordResetEmail}
        loginData={loginData}
        loginErrors={loginErrors}
        loginPending={loginMutation.isPending}
        forgotPasswordData={forgotPasswordData}
        forgotPasswordErrors={forgotPasswordErrors}
        forgotPasswordPending={forgotPasswordMutation.isPending}
        registerData={registerData}
        registerErrors={registerErrors}
        registerPending={registerMutation.isPending}
        onClose={closeAuthModal}
        onLoginChange={handleLoginChange}
        onLoginSubmit={handleLoginSubmit}
        onForgotPasswordChange={handleForgotPasswordChange}
        onForgotPasswordSubmit={handleForgotPasswordSubmit}
        onRegisterChange={handleRegisterChange}
        onRegisterSubmit={handleRegisterSubmit}
        onSwitchToForgotPassword={switchToForgotPassword}
        onSwitchToLogin={switchToLogin}
        onSwitchToSignup={switchToSignup}
      />
    </motion.main>
  );
}
