package app.fashion_tracker.repository;
import app.fashion_tracker.model.ClothingItem;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ClothingItemSpecification {

    private ClothingItemSpecification() {
    }

    public static Specification<ClothingItem> filter(
            Long userId,
            String search,
            String color,
            String brand,
            String size,
            Long categoryId,
            Long tagId
    ) {

        return (root, query, criteriaBuilder) -> {

            query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            // Always restrict results to the authenticated user
            predicates.add(
                    criteriaBuilder.equal(
                            root.get("user").get("id"),
                            userId
                    )
            );

            // Search name, brand, or color
            if (search != null && !search.isBlank()) {

                String searchValue =
                        "%" + search.trim().toLowerCase() + "%";

                Predicate namePredicate =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("name")),
                                searchValue
                        );

                Predicate brandPredicate =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("brand")),
                                searchValue
                        );

                Predicate colorPredicate =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("color")),
                                searchValue
                        );

                predicates.add(
                        criteriaBuilder.or(
                                namePredicate,
                                brandPredicate,
                                colorPredicate
                        )
                );
            }

            // Color filter
            if (color != null && !color.isBlank()) {

                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(root.get("color")),
                                color.trim().toLowerCase()
                        )
                );
            }

            // Brand filter
            if (brand != null && !brand.isBlank()) {

                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(root.get("brand")),
                                brand.trim().toLowerCase()
                        )
                );
            }

            // Size filter
            if (size != null && !size.isBlank()) {

                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(root.get("size")),
                                size.trim().toLowerCase()
                        )
                );
            }

            // Category filter
            if (categoryId != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("category").get("id"),
                                categoryId
                        )
                );
            }

            // Tag filter
            if (tagId != null) {

                Join<Object, Object> tags =
                        root.join("tags", JoinType.INNER);

                predicates.add(
                        criteriaBuilder.equal(
                                tags.get("id"),
                                tagId
                        )
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }
}