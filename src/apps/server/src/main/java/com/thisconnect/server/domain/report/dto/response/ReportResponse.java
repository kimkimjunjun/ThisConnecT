package com.thisconnect.server.domain.report.dto.response;

import com.thisconnect.server.domain.report.entity.Report;

import java.time.format.DateTimeFormatter;

public record ReportResponse(
        Long id,
        Long reporterId,
        String reporterNickname,
        Long reportedId,
        String reportedNickname,
        String reason,
        String createdAt
) {
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static ReportResponse from(Report r) {
        return new ReportResponse(
                r.getId(),
                r.getReporter().getId(),
                r.getReporter().getNickname(),
                r.getReported().getId(),
                r.getReported().getNickname(),
                r.getReason(),
                r.getCreatedAt().format(FMT)
        );
    }
}
