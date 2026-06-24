using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using tickets.Models;

namespace tickets.Controllers.Api
{
    [ApiController]
    [Route("api/auth")]
    public class AuthApiController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AuthApiController(
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            if (User.Identity?.IsAuthenticated != true)
                return Ok(new { isAuthenticated = false });

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Ok(new { isAuthenticated = false });

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                isAuthenticated = true,
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                nickname = user.UserName,
                phoneNumber = user.PhoneNumber,
                isAdmin = roles.Contains("Admin")
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterApiRequest req)
        {
            var user = new AppUser
            {
                UserName = req.Nickname,
                Email = req.Email,
                FirstName = req.FirstName,
                LastName = req.LastName,
                PhoneNumber = req.PhoneNumber
            };

            var result = await _userManager.CreateAsync(user, req.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description).ToArray());

            if (!await _roleManager.RoleExistsAsync("User"))
                await _roleManager.CreateAsync(new IdentityRole("User"));

            await _userManager.AddToRoleAsync(user, "User");
            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                nickname = user.UserName,
                phoneNumber = user.PhoneNumber,
                isAdmin = false
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginApiRequest req)
        {
            var result = await _signInManager.PasswordSignInAsync(req.Nickname, req.Password, false, lockoutOnFailure: true);

            if (result.IsLockedOut)
                return BadRequest(new[] { "Account locked due to too many failed attempts. Try again in a few minutes." });
            if (!result.Succeeded)
                return BadRequest(new[] { "Invalid nickname or password." });

            var user = await _userManager.FindByNameAsync(req.Nickname);
            if (user == null) return BadRequest(new[] { "User not found." });

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                nickname = user.UserName,
                phoneNumber = user.PhoneNumber,
                isAdmin = roles.Contains("Admin")
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logged out." });
        }
    }

    public class RegisterApiRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Nickname { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
    }

    public class LoginApiRequest
    {
        public string Nickname { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
