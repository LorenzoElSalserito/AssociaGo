package com.associago.volunteer.mapper;

import com.associago.volunteer.Volunteer;
import com.associago.volunteer.dto.VolunteerCreateDTO;
import com.associago.volunteer.dto.VolunteerDTO;

public final class VolunteerMapper {

    private VolunteerMapper() {}

    public static VolunteerDTO toDTO(Volunteer volunteer) {
        return new VolunteerDTO(
                volunteer.getId(),
                volunteer.getMemberId(),
                volunteer.getSkills(),
                volunteer.getAvailability(),
                volunteer.getStatus(),
                volunteer.getNotes(),
                volunteer.getCreatedAt(),
                volunteer.getUpdatedAt()
        );
    }

    public static Volunteer toEntity(VolunteerCreateDTO dto) {
        Volunteer volunteer = new Volunteer();
        volunteer.setMemberId(dto.memberId());
        volunteer.setSkills(dto.skills());
        volunteer.setAvailability(dto.availability());
        volunteer.setStatus(dto.status());
        volunteer.setNotes(dto.notes());
        return volunteer;
    }

    public static void updateEntity(Volunteer volunteer, VolunteerCreateDTO dto) {
        volunteer.setMemberId(dto.memberId());
        volunteer.setSkills(dto.skills());
        volunteer.setAvailability(dto.availability());
        volunteer.setStatus(dto.status());
        volunteer.setNotes(dto.notes());
    }
}
