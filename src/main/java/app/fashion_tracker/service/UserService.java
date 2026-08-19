package app.fashion_tracker.service;

import app.fashion_tracker.dto.UpdateProfileRequest;
import app.fashion_tracker.exception.ResourceConflictException;
import app.fashion_tracker.exception.UserNotFoundException;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User updateProfile(
            Long userId,
            UpdateProfileRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        if (request.username() != null &&
                !request.username().equals(user.getUsername())) {

            if (userRepository.existsByUsername(request.username())) {
                throw new ResourceConflictException(
                        "Username is already in use"
                );
            }

            user.setUsername(request.username());
        }

        if (request.email() != null &&
                !request.email().equals(user.getEmail())) {

            if (userRepository.existsByEmail(request.email())) {
                throw new ResourceConflictException(
                        "Email is already in use"
                );
            }

            user.setEmail(request.email());
        }

        return userRepository.save(user);
    }

    public void deleteAccount(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        userRepository.delete(user);
    }
}