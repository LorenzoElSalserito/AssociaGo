package com.associago.stats.dto;

import com.associago.assembly.Assembly;
import com.associago.assembly.AssemblyDocument;
import com.associago.assembly.AssemblyMotion;
import com.associago.assembly.AssemblyParticipant;

import java.util.List;

public class AssemblyWithDetailsDTO {
    private Assembly assembly;
    private List<AssemblyParticipant> participants;
    private List<AssemblyMotion> motions;
    private List<AssemblyDocument> documents;
    
    private Integer totalParticipants;
    private Integer presentParticipants;
    private Integer proxyParticipants;
    private Double participationPercentage;
    private boolean quorumReached;

    // Getters and Setters
    public Assembly getAssembly() { return assembly; }
    public void setAssembly(Assembly assembly) { this.assembly = assembly; }
    public List<AssemblyParticipant> getParticipants() { return participants; }
    public void setParticipants(List<AssemblyParticipant> participants) { this.participants = participants; }
    public List<AssemblyMotion> getMotions() { return motions; }
    public void setMotions(List<AssemblyMotion> motions) { this.motions = motions; }
    public List<AssemblyDocument> getDocuments() { return documents; }
    public void setDocuments(List<AssemblyDocument> documents) { this.documents = documents; }
    public Integer getTotalParticipants() { return totalParticipants; }
    public void setTotalParticipants(Integer totalParticipants) { this.totalParticipants = totalParticipants; }
    public Integer getPresentParticipants() { return presentParticipants; }
    public void setPresentParticipants(Integer presentParticipants) { this.presentParticipants = presentParticipants; }
    public Integer getProxyParticipants() { return proxyParticipants; }
    public void setProxyParticipants(Integer proxyParticipants) { this.proxyParticipants = proxyParticipants; }
    public Double getParticipationPercentage() { return participationPercentage; }
    public void setParticipationPercentage(Double participationPercentage) { this.participationPercentage = participationPercentage; }
    public boolean isQuorumReached() { return quorumReached; }
    public void setQuorumReached(boolean quorumReached) { this.quorumReached = quorumReached; }
}
