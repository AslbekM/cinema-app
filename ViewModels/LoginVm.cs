using System.ComponentModel.DataAnnotations;

namespace tickets.ViewModels
{
    public class LoginVm
    {
        [Required]
        public string Nickname { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;
    }
}