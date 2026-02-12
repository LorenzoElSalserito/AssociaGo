package com.associago.stats.dto;

public class AssemblyGlobalStatsDTO {
    private int totalAssemblies;
    private int assembliesLastYear;
    private double averageParticipants;
    private double quorumReachedPercentage;

    public int getTotalAssemblies() { return totalAssemblies; }
    public void setTotalAssemblies(int totalAssemblies) { this.totalAssemblies = totalAssemblies; }
    public int getAssembliesLastYear() { return assembliesLastYear; }
    public void setAssembliesLastYear(int assembliesLastYear) { this.assembliesLastYear = assembliesLastYear; }
    public double getAverageParticipants() { return averageParticipants; }
    public void setAverageParticipants(double averageParticipants) { this.averageParticipants = averageParticipants; }
    public double getQuorumReachedPercentage() { return quorumReachedPercentage; }
    public void setQuorumReachedPercentage(double quorumReachedPercentage) { this.quorumReachedPercentage = quorumReachedPercentage; }
}
