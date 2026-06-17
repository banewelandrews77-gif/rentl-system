package gh.hostelconnect.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterCustomerRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 255)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20)
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*\\d).+$",
        message = "Password must contain at least 1 uppercase letter and 1 number"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
