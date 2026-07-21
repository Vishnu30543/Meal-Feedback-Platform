package com.ashram.feedback.menu.service;

import com.ashram.feedback.auth.security.JwtUserPrincipal;
import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.common.exception.BusinessException;
import com.ashram.feedback.common.exception.DuplicateResourceException;
import com.ashram.feedback.common.exception.ResourceNotFoundException;
import com.ashram.feedback.dish.entity.Dish;
import com.ashram.feedback.dish.mapper.DishMapper;
import com.ashram.feedback.dish.repository.DishRepository;
import com.ashram.feedback.menu.dto.CopyMenuRequest;
import com.ashram.feedback.menu.dto.CreateMenuRequest;
import com.ashram.feedback.menu.dto.DailyMenuDto;
import com.ashram.feedback.menu.entity.DailyMenu;
import com.ashram.feedback.menu.entity.DailyMenuDish;
import com.ashram.feedback.menu.entity.MealType;
import com.ashram.feedback.menu.repository.DailyMenuDishRepository;
import com.ashram.feedback.menu.repository.DailyMenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuService {

    private final DailyMenuRepository menuRepository;
    private final DailyMenuDishRepository menuDishRepository;
    private final DishRepository dishRepository;
    private final DishMapper dishMapper;

    /**
     * Get today's published menu.
     */
    @Cacheable(value = "menuByDate", key = "'today-' + T(java.time.LocalDate).now().toString()")
    @Transactional(readOnly = true)
    public DailyMenuDto getTodaysMenu() {
        DailyMenu menu = menuRepository.findPublishedByDate(LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Today's menu has not been published yet."));
        return mapToDto(menu);
    }

    /**
     * Get menu by date.
     */
    @Cacheable(value = "menuByDate", key = "#date.toString()")
    @Transactional(readOnly = true)
    public DailyMenuDto getMenuByDate(LocalDate date) {
        DailyMenu menu = menuRepository.findByMenuDate(date)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "date", date));
        return mapToDto(menu);
    }

    /**
     * Get all menus paginated.
     */
    @Transactional(readOnly = true)
    public PagedResponse<DailyMenuDto> getAllMenus(int page, int size) {
        Page<DailyMenu> menuPage = menuRepository.findAllOrderByDateDesc(
                PageRequest.of(page, size));

        List<DailyMenuDto> content = menuPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(content, page, size,
                menuPage.getTotalElements(), menuPage.getTotalPages());
    }

    /**
     * Create a new menu for a date.
     */
    @CacheEvict(value = "menuByDate", allEntries = true)
    @Transactional
    public DailyMenuDto createMenu(CreateMenuRequest request) {
        if (menuRepository.existsByMenuDate(request.getMenuDate())) {
            throw new DuplicateResourceException("Menu", "date", request.getMenuDate());
        }

        Long adminId = getCurrentAdminId();

        DailyMenu menu = DailyMenu.builder()
                .menuDate(request.getMenuDate())
                .remarks(request.getRemarks())
                .specialDay(request.isSpecialDay())
                .festivalName(request.getFestivalName())
                .createdBy(adminId)
                .build();

        menu = menuRepository.save(menu);

        // Add dishes
        for (int i = 0; i < request.getDishes().size(); i++) {
            CreateMenuRequest.MenuDishItem item = request.getDishes().get(i);
            Dish dish = dishRepository.findById(item.getDishId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dish", "id", item.getDishId()));

            DailyMenuDish menuDish = DailyMenuDish.builder()
                    .dailyMenu(menu)
                    .dish(dish)
                    .mealType(item.getMealType() != null ? item.getMealType() : MealType.LUNCH)
                    .displayOrder(item.getDisplayOrder() != null ? item.getDisplayOrder() : i)
                    .build();

            menu.getMenuDishes().add(menuDish);
        }

        menu = menuRepository.save(menu);
        log.info("Created menu for date: {}", request.getMenuDate());

        return mapToDto(menu);
    }

    /**
     * Update menu dishes.
     */
    @CacheEvict(value = "menuByDate", allEntries = true)
    @Transactional
    public DailyMenuDto updateMenu(Long id, CreateMenuRequest request) {
        DailyMenu menu = findMenuOrThrow(id);

        menu.setRemarks(request.getRemarks());
        menu.setSpecialDay(request.isSpecialDay());
        menu.setFestivalName(request.getFestivalName());

        // Clear existing dishes and add new ones
        menu.getMenuDishes().clear();
        menuRepository.save(menu);

        for (int i = 0; i < request.getDishes().size(); i++) {
            CreateMenuRequest.MenuDishItem item = request.getDishes().get(i);
            Dish dish = dishRepository.findById(item.getDishId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dish", "id", item.getDishId()));

            DailyMenuDish menuDish = DailyMenuDish.builder()
                    .dailyMenu(menu)
                    .dish(dish)
                    .mealType(item.getMealType() != null ? item.getMealType() : MealType.LUNCH)
                    .displayOrder(item.getDisplayOrder() != null ? item.getDisplayOrder() : i)
                    .build();

            menu.getMenuDishes().add(menuDish);
        }

        menu = menuRepository.save(menu);
        log.info("Updated menu: {}", menu.getMenuDate());

        return mapToDto(menu);
    }

    /**
     * Copy a previous menu to a target date.
     */
    @CacheEvict(value = "menuByDate", allEntries = true)
    @Transactional
    public DailyMenuDto copyMenu(CopyMenuRequest request) {
        DailyMenu source = menuRepository.findByMenuDate(request.getSourceDate())
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "date", request.getSourceDate()));

        if (menuRepository.existsByMenuDate(request.getTargetDate())) {
            throw new DuplicateResourceException("Menu", "date", request.getTargetDate());
        }

        Long adminId = getCurrentAdminId();

        DailyMenu newMenu = DailyMenu.builder()
                .menuDate(request.getTargetDate())
                .createdBy(adminId)
                .build();

        newMenu = menuRepository.save(newMenu);

        // Copy all dishes from source
        for (DailyMenuDish sourceDish : source.getMenuDishes()) {
            DailyMenuDish copy = DailyMenuDish.builder()
                    .dailyMenu(newMenu)
                    .dish(sourceDish.getDish())
                    .mealType(sourceDish.getMealType())
                    .displayOrder(sourceDish.getDisplayOrder())
                    .build();
            newMenu.getMenuDishes().add(copy);
        }

        newMenu = menuRepository.save(newMenu);
        log.info("Copied menu from {} to {}", request.getSourceDate(), request.getTargetDate());

        return mapToDto(newMenu);
    }

    /**
     * Toggle menu published status.
     */
    @CacheEvict(value = "menuByDate", allEntries = true)
    @Transactional
    public DailyMenuDto togglePublish(Long id) {
        DailyMenu menu = findMenuOrThrow(id);

        if (!menu.isPublished() && menu.getMenuDishes().isEmpty()) {
            throw new BusinessException("Cannot publish an empty menu. Add dishes first.");
        }

        menu.setPublished(!menu.isPublished());
        menu = menuRepository.save(menu);
        log.info("Menu {} {} for date: {}",
                id, menu.isPublished() ? "published" : "unpublished", menu.getMenuDate());

        return mapToDto(menu);
    }

    /**
     * Check if today's menu is published.
     */
    @Transactional(readOnly = true)
    public boolean isTodayMenuPublished() {
        return menuRepository.findPublishedByDate(LocalDate.now()).isPresent();
    }

    private DailyMenu findMenuOrThrow(Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "id", id));
    }

    private DailyMenuDto mapToDto(DailyMenu menu) {
        List<DailyMenuDto.MenuDishDto> dishes = menu.getMenuDishes().stream()
                .map(md -> DailyMenuDto.MenuDishDto.builder()
                        .id(md.getId())
                        .dish(dishMapper.toSummaryDto(md.getDish()))
                        .mealType(md.getMealType())
                        .displayOrder(md.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());

        return DailyMenuDto.builder()
                .id(menu.getId())
                .menuDate(menu.getMenuDate())
                .published(menu.isPublished())
                .remarks(menu.getRemarks())
                .specialDay(menu.isSpecialDay())
                .festivalName(menu.getFestivalName())
                .createdBy(menu.getCreatedBy())
                .dishes(dishes)
                .createdAt(menu.getCreatedAt())
                .build();
    }

    private Long getCurrentAdminId() {
        try {
            JwtUserPrincipal principal = (JwtUserPrincipal) SecurityContextHolder
                    .getContext().getAuthentication().getPrincipal();
            return principal.getUserId();
        } catch (Exception e) {
            return null;
        }
    }
}
