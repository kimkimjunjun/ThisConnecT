package com.thisconnect.server.controller;

import com.thisconnect.server.dto.request.CreateReportRequest;
import com.thisconnect.server.dto.response.ReportResponse;
import com.thisconnect.server.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "Report", description = "신고 API")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "유저 신고", description = "로그인한 사용자가 다른 유저를 신고합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "신고 성공"),
            @ApiResponse(responseCode = "400", description = "유효성 실패 / 자기 자신 신고 시도"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "404", description = "신고 대상자 없음")
    })
    @PostMapping
    public ResponseEntity<ReportResponse> report(
            @Valid @RequestBody CreateReportRequest request,
            Principal principal
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reportService.report(Long.parseLong(principal.getName()), request));
    }

    @Operation(summary = "전체 신고 내역 조회 (ADMIN)", description = "모든 신고 내역을 최신순으로 반환합니다. ADMIN 권한 필요.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "ADMIN 권한 필요")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @Operation(summary = "특정 유저 신고 내역 조회 (ADMIN)", description = "특정 유저에 대한 신고 내역을 최신순으로 반환합니다. ADMIN 권한 필요.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "ADMIN 권한 필요")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{reportedId}")
    public ResponseEntity<List<ReportResponse>> getReportsByReported(@PathVariable Long reportedId) {
        return ResponseEntity.ok(reportService.getReportsByReported(reportedId));
    }
}
