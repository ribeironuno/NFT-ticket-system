using System.ComponentModel.DataAnnotations;

namespace server.Models.ValidationAttributes
{
    public class MaxFileSize : ValidationAttribute
    {
        private readonly int _maxSize;
        private readonly string _errorMessage;

        public MaxFileSize(int maxSize, string errorMessage)
        {
            _maxSize = maxSize;
            _errorMessage = errorMessage;
        }

        protected override ValidationResult IsValid(
        object? value, ValidationContext validationContext)
        {
            var file = value as IFormFile;

            if (file != null)
            {
                if (file.Length > _maxSize)
                {
                    return new ValidationResult(_errorMessage);
                }
            }
            return ValidationResult.Success;
        }
    }
}
