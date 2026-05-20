using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;
using tickets.ViewModels;

namespace tickets.Controllers
{
    [Authorize]
    public class ProfileController : Controller
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly AppDb _db;

        public ProfileController(
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            AppDb db)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
                return RedirectToAction("Login", "Account");

            var model = new ProfileVm
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? "",
                Nickname = user.UserName ?? "",
                PhoneNumber = user.PhoneNumber,
                RowVersion = user.RowVersion
            };

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index(ProfileVm model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == model.Id);

            if (user == null)
                return RedirectToAction("Login", "Account");

            var currentUserId = _userManager.GetUserId(User);
            if (user.Id != currentUserId)
                return Forbid();

            _db.Entry(user).Property(nameof(AppUser.RowVersion)).OriginalValue = model.RowVersion;

            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.Email = model.Email;
            user.UserName = model.Nickname;
            user.PhoneNumber = model.PhoneNumber;

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                ModelState.AddModelError("", "Your profile was changed by another session/admin. Reload the page and try again.");

                var current = await _db.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == model.Id);

                if (current != null)
                {
                    model.FirstName = current.FirstName;
                    model.LastName = current.LastName;
                    model.Email = current.Email ?? "";
                    model.Nickname = current.UserName ?? "";
                    model.PhoneNumber = current.PhoneNumber;
                    model.RowVersion = current.RowVersion;
                }

                return View(model);
            }

            if (!string.IsNullOrWhiteSpace(model.NewPassword))
            {
                if (string.IsNullOrWhiteSpace(model.CurrentPassword))
                {
                    ModelState.AddModelError("", "To change password, enter your current password.");

                    var refreshed = await _db.Users
                        .AsNoTracking()
                        .FirstOrDefaultAsync(u => u.Id == model.Id);

                    if (refreshed != null)
                        model.RowVersion = refreshed.RowVersion;

                    return View(model);
                }

                var passwordResult = await _userManager.ChangePasswordAsync(
                    user,
                    model.CurrentPassword,
                    model.NewPassword);

                if (!passwordResult.Succeeded)
                {
                    foreach (var error in passwordResult.Errors)
                        ModelState.AddModelError("", error.Description);

                    var refreshed = await _db.Users
                        .AsNoTracking()
                        .FirstOrDefaultAsync(u => u.Id == model.Id);

                    if (refreshed != null)
                        model.RowVersion = refreshed.RowVersion;

                    return View(model);
                }
            }

            await _signInManager.RefreshSignInAsync(user);
            TempData["ProfileSuccess"] = "Profile updated successfully.";

            return RedirectToAction(nameof(Index));
        }
    }
}