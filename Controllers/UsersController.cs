using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using tickets.Data;
using tickets.Models;
using tickets.ViewModels;

namespace tickets.Controllers
{
    [Authorize(Roles = "Admin")]
    public class UsersController : Controller
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly AppDb _db;

        public UsersController(UserManager<AppUser> userManager, AppDb db)
        {
            _userManager = userManager;
            _db = db;
        }

        public IActionResult Index()
        {
            var users = _userManager.Users.ToList();
            return View(users);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(string id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound();

            return View(new UserEditVm
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? "",
                Nickname = user.UserName ?? "",
                PhoneNumber = user.PhoneNumber,
                RowVersion = user.RowVersion
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(UserEditVm model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == model.Id);

            if (user == null)
            {
                ModelState.AddModelError("", "This user was already deleted by another admin.");
                return View(model);
            }

            _db.Entry(user).Property(nameof(AppUser.RowVersion)).OriginalValue = model.RowVersion;

            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.Email = model.Email;
            user.UserName = model.Nickname;
            user.PhoneNumber = model.PhoneNumber;

            try
            {
                await _db.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            catch (DbUpdateConcurrencyException)
            {
                ModelState.AddModelError("", "This user was changed by another admin. Reload the page and try again.");

                var current = await _db.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == model.Id);

                if (current != null)
                {
                    model.FirstName = current.FirstName;
                    model.LastName = current.LastName;
                    model.Email = current.Email ?? "";
                    model.Nickname = current.UserName ?? "";
                    model.RowVersion = current.RowVersion;
                }

                return View(model);
            }
        }

        [HttpGet]
        public async Task<IActionResult> Delete(string id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound();

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
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == model.Id);

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

            _db.Entry(user).Property(nameof(AppUser.RowVersion)).OriginalValue = model.RowVersion;

            try
            {
                _db.Users.Remove(user);
                await _db.SaveChangesAsync();

                TempData["UserSuccess"] = "User deleted successfully.";
                return RedirectToAction(nameof(Index));
            }
            catch (DbUpdateConcurrencyException)
            {
                TempData["UserError"] = "This user was changed or deleted by another admin. Delete cancelled.";
                return RedirectToAction(nameof(Index));
            }
        }
    }
}