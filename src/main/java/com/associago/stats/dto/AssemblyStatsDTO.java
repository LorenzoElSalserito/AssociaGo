package com.associago.stats.dto;

public class AssemblyStatsDTO {
    private Long assemblyId;
    private String title;
    private Integer totalParticipants;
    private Integer eligibleVoters; // Aventi diritto
    private Double attendanceRate; // Percentage
    private Integer totalMotions;
    private boolean isQuorumReached;

    // Getters and Setters
    public Long getAssemblyId() { return assemblyId; }
    public void setAssemblyId(Long assemblyId) { this.assemblyId = assemblyId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Integer getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(Integer totalParticipants) { this.totalParticipants = totalParticipants; }
    public Integer getEligibleVoters() { return eligibleVoters; }
    public void setEligibleVoters(Integer eligibleVoters) { this.eligibleVoters = eligibleVoters; }
    public Double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(Double attendanceRate) { this.attendanceRate = attendanceRate; }
    public Integer getTotalMotions() { return totalMotions; }
    public void setTotalMotions(Integer totalMotions) { this.totalMotions = totalMotions; }
    public boolean isQuorumReached() { return isQuorumReached; }
    public void setQuorumReached(boolean quorumReached) { isQuorumReached = quorumReached; }
}
