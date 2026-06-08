package com.thisconnect.server.domain.report.service;

import com.thisconnect.server.domain.member.entity.Member;
import com.thisconnect.server.domain.report.entity.Report;
import com.thisconnect.server.domain.report.dto.request.CreateReportRequest;
import com.thisconnect.server.domain.report.dto.response.ReportResponse;
import com.thisconnect.server.domain.member.repository.MemberRepository;
import com.thisconnect.server.domain.report.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final MemberRepository memberRepository;

    public ReportResponse report(Long reporterId, CreateReportRequest request) {
        Member reporter = memberRepository.findById(reporterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "신고자를 찾을 수 없습니다"));
        Member reported = memberRepository.findById(request.reportedId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "신고 대상자를 찾을 수 없습니다"));
        if (reporterId.equals(request.reportedId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자기 자신을 신고할 수 없습니다");
        }
        Report saved = reportRepository.save(Report.builder()
                .reporter(reporter)
                .reported(reported)
                .reason(request.reason())
                .build());
        return ReportResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(ReportResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getReportsByReported(Long reportedId) {
        return reportRepository.findByReportedIdOrderByCreatedAtDesc(reportedId)
                .stream().map(ReportResponse::from).toList();
    }
}
