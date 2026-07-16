package com.ashram.feedback.menu.controller;

import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.menu.dto.CopyMenuRequest;
import com.ashram.feedback.menu.dto.CreateMenuRequest;
import com.ashram.feedback.menu.dto.DailyMenuDto;
import com.ashram.feedback.menu.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@Tag(name = "Menus", description = "Daily menu management endpoints")
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/today")
    @Operation(summary = "Get today's published menu")
    public ResponseEntity<ApiResponse<DailyMenuDto>> getTodaysMenu() {
        return ResponseEntity.ok(ApiResponse.success(menuService.getTodaysMenu()));
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get menu by date")
    public ResponseEntity<ApiResponse<DailyMenuDto>> getMenuByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(menuService.getMenuByDate(date)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all menus", description = "Paginated list of all menus")
    public ResponseEntity<ApiResponse<PagedResponse<DailyMenuDto>>> getAllMenus(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(menuService.getAllMenus(page, size)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create menu", description = "Create a new daily menu with dishes")
    public ResponseEntity<ApiResponse<DailyMenuDto>> createMenu(
            @Valid @RequestBody CreateMenuRequest request) {
        DailyMenuDto menu = menuService.createMenu(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Menu created successfully", menu));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update menu", description = "Update menu dishes and details")
    public ResponseEntity<ApiResponse<DailyMenuDto>> updateMenu(
            @PathVariable Long id,
            @Valid @RequestBody CreateMenuRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Menu updated successfully",
                menuService.updateMenu(id, request)));
    }

    @PostMapping("/copy")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Copy menu", description = "Copy a previous day's menu to a new date")
    public ResponseEntity<ApiResponse<DailyMenuDto>> copyMenu(
            @Valid @RequestBody CopyMenuRequest request) {
        DailyMenuDto menu = menuService.copyMenu(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Menu copied successfully", menu));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle publish", description = "Publish or unpublish a menu")
    public ResponseEntity<ApiResponse<DailyMenuDto>> togglePublish(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(menuService.togglePublish(id)));
    }
}
