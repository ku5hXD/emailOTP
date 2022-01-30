const otpTemplate = {
    Template: {
        TemplateName: "otpTemplate",
        SubjectPart: "OTP: For Sign Up | Acadio",
        HtmlPart:
            '<!DOCTYPE html><head><meta charset=\"UTF-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Document</title></head><body><div><h1> Dear User, </h1><h3> OTP for Sign Up is {{ OTP }}</h3><br><img src="http://bloggingidea.in/wp-content/uploads/2021/08/1615610351092-1-1024x333.png" alt="M416 Glacier Bolte"></div></body></html>'
    },
};

module.exports = otpTemplate;