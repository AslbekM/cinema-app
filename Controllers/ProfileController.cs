using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using tickets.Models;
using tickets.ViewModels;

namespace tickets.Controllers
{
    [Authorize]
    public class ProfileController : Controller
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;

        public ProfileController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return RedirectToAction("Login", "Account");

            return View(new ProfileVm
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? "",
                Nickname = user.UserName ?? "",
                RowVersion = user.RowVersion
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index(ProfileVm model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return RedirectToAction("Login", "Account");

            if (user.Id != model.Id)
                return Forbid();

            if (!string.IsNullOrWhiteSpace(model.NewPassword) && string.IsNullOrWhiteSpace(model.CurrentPassword))
            {
                ModelState.AddModelError("", "To change password, enter your current password.");
                return View(model);
            }

            if (!RowVersionsMatch(user.RowVersion, model.RowVersion))
            {
                ModelState.AddModelError("", "Your profile was changed by another session or admin. Reload the page and try again.");
                model.FirstName = user.FirstName;
                model.LastName = user.LastName;
                model.Email = user.Email ?? "";
                model.Nickname = user.UserName ?? "";
                model.RowVersion = user.RowVersion;
                return View(model);
            }

            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.Email = model.Email;
            user.UserName = model.Nickname;

            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
            {
                foreach (var error in updateResult.Errors)
                    ModelState.AddModelError("", error.Description);

                return View(model);
            }

            if (!string.IsNullOrWhiteSpace(model.NewPassword))
            {
                var passwordResult = await _userManager.ChangePasswordAsync(
                    user,
                    model.CurrentPassword!,
                    model.NewPassword);

                if (!passwordResult.Succeeded)
                {
                    foreach (var error in passwordResult.Errors)
                        ModelState.AddModelError("", error.Description);

                    model.RowVersion = user.RowVersion;
                    return View(model);
                }
            }

            await _signInManager.RefreshSignInAsync(user);
            TempData["ProfileSuccess"] = "Profile updated successfully.";
            return RedirectToAction(nameof(Index));
        }

        private static bool RowVersionsMatch(byte[]? a, byte[]? b)
        {
            if (a == null && b == null) return true;
            if (a == null || b == null) return false;
            return a.SequenceEqual(b);
        }
    }
}
