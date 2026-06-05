package com.thisconnect.server.domain.report.repository;

import com.thisconnect.server.domain.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findAllByOrderByCreatedAtDesc();

    List<Report> findByReportedIdOrderByCreatedAtDesc(Long reportedId);
}
