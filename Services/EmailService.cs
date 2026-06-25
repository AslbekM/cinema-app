using SendGrid;
using SendGrid.Helpers.Mail;

namespace tickets.Services
{
    public interface IEmailService
    {
        Task SendAsync(string toEmail, string subject, string htmlBody);
    }

    /// <summary>
    /// Sends email via SendGrid. If no API key is configured the service is a
    /// no-op (logs and returns), so booking never fails because email isn't set up.
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly string? _apiKey;
        private readonly string _from;
        private readonly string _fromName;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _apiKey = config["SendGrid:ApiKey"];
            _from = config["SendGrid:FromEmail"] ?? "no-reply@adafcinema.app";
            _fromName = config["SendGrid:FromName"] ?? "adafcinema";
            _logger = logger;
        }

        public async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                _logger.LogInformation("Email skipped (no SendGrid API key): {Subject} -> {To}", subject, toEmail);
                return;
            }

            try
            {
                var client = new SendGridClient(_apiKey);
                var msg = MailHelper.CreateSingleEmail(
                    new EmailAddress(_from, _fromName),
                    new EmailAddress(toEmail),
                    subject,
                    plainTextContent: null,
                    htmlContent: htmlBody);
                await client.SendEmailAsync(msg);
            }
            catch (Exception ex)
            {
                // Never let an email failure break the booking flow.
                _logger.LogWarning(ex, "Failed to send email to {To}", toEmail);
            }
        }
    }
}
