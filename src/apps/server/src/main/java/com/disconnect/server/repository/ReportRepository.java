package com.disconnect.server.repository;

import com.disconnect.server.domain.report.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findAllByOrderByCreatedAtDesc();

    List<Report> findByReportedIdOrderByCreatedAtDesc(Long reportedId);
}
