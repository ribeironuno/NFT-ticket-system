using System.Collections;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using server.Utils;

namespace server.Models.Event.ValidationAttributes
{
    public class RegexValidation : ValidationAttribute
    {
        private readonly string _regex;
        private readonly string _errorMessage;

        public RegexValidation(string regex, string errorMessage)
        {
            _regex = Dummy.getExpression(regex);
            _errorMessage = errorMessage;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var toValidate = value as string;

            if (toValidate != null && !Regex.Match(toValidate, _regex).Success)
            {
                return new ValidationResult(_errorMessage);
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
            { "urlPattern", Validations.urlPattern }
        };

        public static string getExpression(string attribute)
        {
            return _attributes[attribute];
        }
    }
}
