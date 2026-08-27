package app.fashion_tracker.service;

import app.fashion_tracker.dto.CreateTagRequest;
import app.fashion_tracker.dto.TagResponse;
import app.fashion_tracker.model.Tag;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.TagRepository;
import app.fashion_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TagService {

    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    public TagService(
            TagRepository tagRepository,
            UserRepository userRepository
    ) {
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TagResponse create(
            Long userId,
            CreateTagRequest request
    ) {

        if (tagRepository.existsByUserIdAndName(
                userId,
                request.name()
        )) {
            throw new IllegalArgumentException(
                    "Tag already exists"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Tag tag = new Tag();

        tag.setUser(user);
        tag.setName(request.name());

        return toResponse(tagRepository.save(tag));
    }

    @Transactional(readOnly = true)
    public List<TagResponse> getAll(Long userId) {

        return tagRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void delete(
            Long userId,
            Long tagId
    ) {

        Tag tag = tagRepository.findById(tagId)
                .filter(t ->
                        t.getUser().getId().equals(userId)
                )
                .orElseThrow(() ->
                        new IllegalArgumentException("Tag not found")
                );

        tagRepository.delete(tag);
    }

    private TagResponse toResponse(Tag tag) {
        return new TagResponse(
                tag.getId(),
                tag.getName()
        );
    }
}