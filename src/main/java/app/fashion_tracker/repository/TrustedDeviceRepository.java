package app.fashion_tracker.repository;

import app.fashion_tracker.model.TrustedDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrustedDeviceRepository extends JpaRepository<TrustedDevice, Long> {

    Optional<TrustedDevice> findByUserIdAndDeviceTokenHash(Long userId, String deviceTokenHash);
    void deleteAllByUserId(Long userId);
}