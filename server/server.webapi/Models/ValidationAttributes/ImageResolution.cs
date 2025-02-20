using SixLabors.ImageSharp;
using System.ComponentModel.DataAnnotations;

namespace server.Models.ValidationAttributes
{
    public class ImageResolution : ValidationAttribute
    {
        private readonly int _heightUpperBound;
        private readonly int _heightLowerBound;
        private readonly int _widthUpperBound;
        private readonly int _widthLowerBound;
        private readonly string _errorMessage;

        public ImageResolution(int heightUpperBound, int heightLowerBound,
            int widthUpperBound, int widthLowerBound, string errorMessage)
        {
            _heightUpperBound = heightUpperBound;
            _heightLowerBound = heightLowerBound;
            _widthUpperBound = widthUpperBound;
            _widthLowerBound = widthLowerBound;
            _errorMessage = errorMessage;
        }
        protected override ValidationResult IsValid(
        object? value, ValidationContext validationContext)
        {
            var file = value as IFormFile;

            if (file != null)
            {
                using (var image = Image.Load(file.OpenReadStream()))
                {
                    if (image.Height < _heightLowerBound || image.Height > _heightUpperBound)
                    {
                        return new ValidationResult(_errorMessage);
                    }

                    if (image.Width < _widthLowerBound || image.Width > _widthUpperBound)
                    {
                        return new ValidationResult(_errorMessage);
                    }
                }
            }
            return ValidationResult.Success;
        }
    }
}
