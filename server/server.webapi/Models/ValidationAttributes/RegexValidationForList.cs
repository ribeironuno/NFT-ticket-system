using server.Utils;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace server.Models.ValidationAttributes
{
    public class RegexValidationForList : ValidationAttribute
    {
        private readonly string _regex;
        private readonly string _errorMessage;

        public RegexValidationForList(string regex, string errorMessage)
        {
            _regex = Dummy.getExpression(regex);
            _errorMessage = errorMessage;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var toValidate = value as string[];

            if (toValidate != null)
            {
                for(var i = 0; i < toValidate.Length; i++)
                {
                    if (!Regex.Match(toValidate[i], _regex).Success)
                    {
                        return new ValidationResult(_errorMessage + " at index " + i);
                    }
                }
            }
            return ValidationResult.Success;
        }
    }

    public static class Dummy
    {
        public static IDictionary<string, string> _attributes = new Dictionary<string, string>{
            { "emailPattern", Validations.emailPattern },
            { "datePattern", Validations.datePattern },
            { "hourPattern", Validations.hourPattern },
            { "phoneNumberPattern", Validations.phoneNumberPattern },
            { "urlPattern", Validations.urlPattern }
        };

        public static string getExpression(string attribute)
        {
            return _attributes[attribute];
        }
    }
}
