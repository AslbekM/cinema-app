using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using tickets.Models;
using tickets.ViewModels;

namespace tickets.Controllers
{
    [Authorize(Roles = "Admin")]
    public class UsersController : Controller
    {
        private readonly UserManager<AppUser> _userManager;

        public UsersController(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            var users = _userManager.Users.ToList();
            return View(users);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            return View(new UserEditVm
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
        public async Task<IActionResult> Edit(UserEditVm model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = await _userManager.FindByIdAsync(model.Id);
            if (user == null)
            {
                ModelState.AddModelError("", "This user was already deleted by another admin.");
                return View(model);
            }

            if (!RowVersionsMatch(user.RowVersion, model.RowVersion))
            {
                ModelState.AddModelError("", "This user was changed by another admin. Reload the page and try again.");
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

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
                return RedirectToAction(nameof(Index));

            foreach (var error in result.Errors)
                ModelState.AddModelError("", error.Description);

            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> Delete(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            return View(new UserDeleteVm
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? "",
                Nickname = user.UserName ?? "",
                RowVersion = user.RowVersion
            });
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(UserDeleteVm model)
        {
            var user = await _userManager.FindByIdAsync(model.Id);
            if (user == null)
            {
                TempData["UserError"] = "This user was already deleted by another admin.";
                return RedirectToAction(nameof(Index));
            }

            if (user.UserName == "admin")
            {
                TempData["UserError"] = "The main admin account cannot be deleted.";
                return RedirectToAction(nameof(Index));
            }

            if (!RowVersionsMatch(user.RowVersion, model.RowVersion))
            {
                TempData["UserError"] = "This user was changed by another admin. Delete cancelled.";
                return RedirectToAction(nameof(Index));
            }

            var result = await _userManager.DeleteAsync(user);

            if (result.Succeeded)
            {
                TempData["UserSuccess"] = "User deleted successfully.";
                return RedirectToAction(nameof(Index));
            }

            TempData["UserError"] = string.Join(" ", result.Errors.Select(e => e.Description));
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
