import PropTypes from "prop-types";

const OtpVerification = ({
  visible,
  recipient,
  title,
  description,
  otpValue,
  onOtpChange,
  onVerify,
  onResend,
  isVerifying,
  isResending,
  verifyButtonText,
  resendButtonText,
  inputPlaceholder,
  inputMaxLength,
  inputMode,
  className,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div className={`mt-4 border border-dashed border-gray-300 rounded p-4 bg-gray-50 ${className}`.trim()}>
      {title ? <p className="text-sm font-semibold text-gray-800 mb-2">{title}</p> : null}
      <p className="text-sm text-gray-700 mb-3">
        {description} <span className="font-medium">{recipient}</span>
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          inputMode={inputMode}
          maxLength={inputMaxLength}
          value={otpValue}
          onChange={(event) => onOtpChange(event.target.value)}
          placeholder={inputPlaceholder}
          className="border border-gray-300 rounded py-2 px-3 flex-1"
        />
        <button
          type="button"
          onClick={onVerify}
          disabled={isVerifying}
          className="bg-black text-white px-6 py-3 min-w-[150px] whitespace-nowrap rounded disabled:bg-gray-400"
        >
          {isVerifying ? `${verifyButtonText}...` : verifyButtonText}
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={isResending}
          className="border border-gray-300 px-6 py-3 min-w-[150px] whitespace-nowrap rounded hover:bg-gray-100 disabled:cursor-not-allowed"
        >
          {isResending ? `${resendButtonText}...` : resendButtonText}
        </button>
      </div>
    </div>
  );
};

OtpVerification.propTypes = {
  visible: PropTypes.bool,
  recipient: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string.isRequired,
  otpValue: PropTypes.string.isRequired,
  onOtpChange: PropTypes.func.isRequired,
  onVerify: PropTypes.func.isRequired,
  onResend: PropTypes.func.isRequired,
  isVerifying: PropTypes.bool,
  isResending: PropTypes.bool,
  verifyButtonText: PropTypes.string,
  resendButtonText: PropTypes.string,
  inputPlaceholder: PropTypes.string,
  inputMaxLength: PropTypes.number,
  inputMode: PropTypes.oneOf(["text", "numeric", "decimal", "tel", "search", "email", "url"]),
  className: PropTypes.string,
};

OtpVerification.defaultProps = {
  visible: true,
  title: "",
  isVerifying: false,
  isResending: false,
  verifyButtonText: "VERIFY OTP",
  resendButtonText: "RESEND OTP",
  inputPlaceholder: "Enter OTP",
  inputMaxLength: 6,
  inputMode: "numeric",
  className: "",
};

export default OtpVerification;