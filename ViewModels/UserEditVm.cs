using System.ComponentModel.DataAnnotations;

namespace tickets.ViewModels
{
    public class UserEditVm
    {
        public string Id { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(30)]
        public string Nickname { get; set; } = string.Empty;
    }
}