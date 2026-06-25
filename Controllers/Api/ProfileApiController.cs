using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;
using tickets.Services;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileApiController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly AppDb _db;
        private readonly IAuditService _audit;

        public ProfileApiController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, AppDb db, IAuditService audit)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _db = db;
            _audit = audit;
        }

        // GDPR: a user can permanently delete their own account and all their reservations.
        [HttpDelete]
        public async Task<IActionResult> DeleteAccount()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();
            if (user.UserName == "admin")
                return BadRequest(new[] { "The main admin account cannot be deleted." });

            await _audit.LogAsync("DeleteAccount", $"User {user.UserName} deleted their own account");

            // Remove the user's reservations first (FK is Restrict).
            var mine = _db.Reservations.Where(r => r.AppUserId == user.Id);
            _db.Reservations.RemoveRange(mine);
            await _db.SaveChangesAsync();

            await _signInManager.SignOutAsync();
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description).ToArray());

            return Ok(new { message = "Account deleted." });
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            return Ok(new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                nickname = user.UserName,
                phoneNumber = user.PhoneNumber,
                rowVersion = user.RowVersion != null ? Convert.ToBase64String(user.RowVersion) : null
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileApiRequest req)
        {
            var currentUserId = _userManager.GetUserId(User);
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == currentUserId);
            if (user == null) return Unauthorized();

            if (!string.IsNullOrEmpty(req.RowVersion))
            {
                try
                {
                    _db.Entry(user).Property(nameof(AppUser.RowVersion)).OriginalValue =
                        Convert.FromBase64String(req.RowVersion);
                }
                catch
                {
                    return BadRequest(new[] { "Invalid row version." });
                }
            }

            user.FirstName = req.FirstName;
            user.LastName = req.LastName;
            user.Email = req.Email;
            user.UserName = req.Nickname;
            user.PhoneNumber = req.PhoneNumber;

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new[] { "Profile was changed by another session. Please reload and try again." });
            }

            if (!string.IsNullOrWhiteSpace(req.NewPassword))
            {
                if (string.IsNullOrWhiteSpace(req.CurrentPassword))
                    return BadRequest(new[] { "Current password is required to change password." });

                var pwResult = await _userManager.ChangePasswordAsync(user, req.CurrentPassword, req.NewPassword);
                if (!pwResult.Succeeded)
                    return BadRequest(pwResult.Errors.Select(e => e.Description).ToArray());
            }

            await _signInManager.RefreshSignInAsync(user);

            return Ok(new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                nickname = user.UserName,
                phoneNumber = user.PhoneNumber,
                rowVersion = user.RowVersion != null ? Convert.ToBase64String(user.RowVersion) : null
            });
        }
    }

    public class UpdateProfileApiRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Nickname { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? RowVersion { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}
