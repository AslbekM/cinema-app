using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UsersApiController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly AppDb _db;

        public UsersApiController(UserManager<AppUser> userManager, AppDb db)
        {
            _userManager = userManager;
            _db = db;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userManager.Users.ToList().Select(u => new
            {
                id = u.Id,
                firstName = u.FirstName,
                lastName = u.LastName,
                email = u.Email,
                nickname = u.UserName,
                phoneNumber = u.PhoneNumber,
                // One-way salted hash (PBKDF2). The plaintext password is never stored
                // and cannot be recovered from this value — shown for transparency only.
                passwordHash = u.PasswordHash,
                rowVersion = u.RowVersion != null ? Convert.ToBase64String(u.RowVersion) : null
            });
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

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

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateUserApiRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound(new[] { "User was already deleted." });

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
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new[] { "User was changed by another admin. Please reload and try again." });
            }
        }

        [HttpPatch("{id}/password")]
        public async Task<IActionResult> ChangePassword(string id, [FromBody] AdminChangePasswordRequest req)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound(new[] { "User not found." });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, req.NewPassword);

            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description).ToArray());

            return Ok(new { message = "Password changed." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, [FromBody] DeleteUserApiRequest req)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return Ok(new { message = "User was already deleted." });

            if (user.UserName == "admin")
                return BadRequest(new[] { "The main admin account cannot be deleted." });

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

            _db.Users.Remove(user);

            try
            {
                await _db.SaveChangesAsync();
                return Ok(new { message = "User deleted." });
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict(new[] { "User was changed by another admin. Delete cancelled." });
            }
        }
    }

    public class UpdateUserApiRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Nickname { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? RowVersion { get; set; }
    }

    public class AdminChangePasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
    }

    public class DeleteUserApiRequest
    {
        public string? RowVersion { get; set; }
    }
}
