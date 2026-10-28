package com.associago.coupon;

import com.associago.activity.Activity;
import com.associago.activity.ActivityParticipant;
import com.associago.activity.ActivityService;
import com.associago.association.Association;
import com.associago.association.AssociationService;
import com.associago.event.Event;
import com.associago.event.EventParticipant;
import com.associago.event.EventService;
import com.associago.user.User;
import com.associago.user.UserService;
import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class CouponRedemptionTests {

    static {
        if (System.getProperty("associago.data.path") == null) {
            File tmp = new File(System.getProperty("java.io.tmpdir"), "associago-test-" + UUID.randomUUID());
            // noinspection ResultOfMethodCallIgnored
            tmp.mkdirs();
            System.setProperty("associago.data.path", tmp.getAbsolutePath());
        }
    }

    @Autowired private CouponService couponService;
    @Autowired private ActivityService activityService;
    @Autowired private EventService eventService;
    @Autowired private AssociationService associationService;
    @Autowired private UserService userService;
    @Autowired private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Test
    void percentageCouponDiscountsActivityAndCountsOneUse() {
        Association association = association();
        Activity activity = activity(association, "80.00");
        Coupon coupon = coupon(association, "Estate10", "PERCENTAGE", "10", 0);

        ActivityParticipant saved = register(activity, "  estate10 ");

        assertThat(saved.getCouponId()).isEqualTo(coupon.getId());
        assertThat(saved.getCouponCode()).isEqualTo("Estate10");
        assertThat(saved.getOriginalAmount()).isEqualByComparingTo("80.00");
        assertThat(saved.getDiscountAmount()).isEqualByComparingTo("8.00");
        assertThat(saved.getAmountDue()).isEqualByComparingTo("72.00");
        assertThat(uses(coupon)).isEqualTo(1);
        assertThat(activityService.getActivityWithDetails(activity.getId()).getPendingRevenue())
                .isEqualByComparingTo("72.00");
    }

    @Test
    void fixedCouponIsCappedAndClientAmountsAreIgnored() {
        Association association = association();
        Activity activity = activity(association, "30.00");
        coupon(association, "MENO50", "FIXED_AMOUNT", "50", 0);

        ActivityParticipant p = new ActivityParticipant();
        p.setActivityId(activity.getId());
        p.setUser(user());
        p.setRegistrationDate(LocalDate.now());
        p.setCouponCode("MENO50");
        p.setDiscountAmount(new BigDecimal("999"));
        p.setAmountDue(new BigDecimal("-1"));
        ActivityParticipant saved = activityService.registerParticipant(p);

        assertThat(saved.getDiscountAmount()).isEqualByComparingTo("30.00");
        assertThat(saved.getAmountDue()).isEqualByComparingTo("0.00");

        ActivityParticipant plain = register(activity, null);
        assertThat(plain.getCouponId()).isNull();
        assertThat(plain.getAmountDue()).isEqualByComparingTo("30.00");
    }

    @Test
    void usageLimitIsEnforcedAndCountedOnce() {
        Association association = association();
        Activity activity = activity(association, "20.00");
        Coupon coupon = coupon(association, "UNO", "FIXED_AMOUNT", "5", 1);

        register(activity, "UNO");
        assertThat(uses(coupon)).isEqualTo(1);

        assertThatThrownBy(() -> register(activity, "UNO"))
                .isInstanceOf(CouponValidationException.class)
                .hasMessage(CouponService.USAGE_LIMIT);
        assertThat(uses(coupon)).isEqualTo(1);
        assertThat(activityService.findParticipantsByActivityId(activity.getId())).hasSize(1);
    }

    @Test
    void expiredInactiveNotStartedAndUnknownCodesAreRejected() {
        Association association = association();
        Activity activity = activity(association, "20.00");
        Coupon expired = coupon(association, "OLD", "PERCENTAGE", "10", 0);
        expired.setEndDate(LocalDate.now().minusDays(1));
        couponService.save(expired);
        Coupon future = coupon(association, "SOON", "PERCENTAGE", "10", 0);
        future.setStartDate(LocalDate.now().plusDays(3));
        couponService.save(future);
        Coupon off = coupon(association, "OFF", "PERCENTAGE", "10", 0);
        off.setActive(false);
        couponService.save(off);

        assertRejected(() -> register(activity, "OLD"), CouponService.EXPIRED);
        assertRejected(() -> register(activity, "SOON"), CouponService.NOT_STARTED);
        assertRejected(() -> register(activity, "OFF"), CouponService.INACTIVE);
        assertRejected(() -> register(activity, "MISSING"), CouponService.NOT_FOUND);
        assertThat(uses(expired)).isZero();
    }

    @Test
    void couponLinkedToAnotherActivityOrEventIsRejected() {
        Association association = association();
        Activity yoga = activity(association, "40.00");
        Activity pilates = activity(association, "40.00");
        Event dinner = event(association, "15.00", "25.00");
        Coupon coupon = coupon(association, "YOGA", "PERCENTAGE", "50", 0);
        coupon.setApplicableActivities(Set.of(yoga));
        couponService.save(coupon);

        assertThat(register(yoga, "YOGA").getAmountDue()).isEqualByComparingTo("20.00");
        assertRejected(() -> register(pilates, "YOGA"), CouponService.NOT_APPLICABLE);
        assertRejected(() -> guest(dinner, "YOGA"), CouponService.NOT_APPLICABLE);
        assertThat(uses(coupon)).isEqualTo(1);
    }

    @Test
    void minimumAmountUsesTheMemberOrGuestEventPrice() {
        Association association = association();
        Event dinner = event(association, "15.00", "25.00");
        Coupon coupon = coupon(association, "CENA", "FIXED_AMOUNT", "5", 0);
        coupon.setMinAmount(new BigDecimal("20.00"));
        couponService.save(coupon);

        assertThatThrownBy(() -> couponService.quoteForEvent(dinner.getId(), "CENA", true, null))
                .hasMessage(CouponService.MIN_AMOUNT);
        CouponService.CouponQuote guestQuote = couponService.quoteForEvent(dinner.getId(), "CENA", false, null);
        assertThat(guestQuote.finalAmount()).isEqualByComparingTo("20.00");

        EventParticipant guest = guest(dinner, "cena");
        assertThat(guest.getCouponId()).isEqualTo(coupon.getId());
        assertThat(guest.getOriginalAmount()).isEqualByComparingTo("25.00");
        assertThat(guest.getAmountDue()).isEqualByComparingTo("20.00");
        assertThat(uses(coupon)).isEqualTo(1);

        eventService.updatePaymentStatus(dinner.getId(), guest.getId(), "PAID");
        assertThat(eventService.getEventSummary(dinner.getId()).getTotalRevenue()).isEqualByComparingTo("20.00");

        eventService.removeParticipant(guest.getId());
        assertThat(uses(coupon)).isEqualTo(1);
    }

    @Test
    void activeFlagRoundTripsAsIsActive() throws Exception {
        Coupon coupon = objectMapper.readValue("{\"code\":\"X\",\"isActive\":false}", Coupon.class);
        assertThat(coupon.isActive()).isFalse();
        assertThat(objectMapper.writeValueAsString(coupon)).contains("\"isActive\":false").doesNotContain("\"active\"");
    }

    private void assertRejected(org.assertj.core.api.ThrowableAssert.ThrowingCallable call, String code) {
        assertThatThrownBy(call).isInstanceOf(CouponValidationException.class).hasMessage(code);
    }

    private int uses(Coupon coupon) {
        return couponService.findById(coupon.getId()).orElseThrow().getCurrentUses();
    }

    private ActivityParticipant register(Activity activity, String code) {
        ActivityParticipant p = new ActivityParticipant();
        p.setActivityId(activity.getId());
        p.setUser(user());
        p.setRegistrationDate(LocalDate.now());
        p.setCouponCode(code);
        return activityService.registerParticipant(p);
    }

    private EventParticipant guest(Event event, String code) {
        EventParticipant p = new EventParticipant();
        p.setEvent(event);
        p.setGuestName("Ospite");
        p.setCouponCode(code);
        return eventService.addParticipant(p);
    }

    private Association association() {
        String marker = UUID.randomUUID().toString().substring(0, 8);
        Association association = new Association();
        association.setName("Coupon " + marker);
        association.setSlug("cp" + marker);
        association.setEmail("cp-" + marker + "@example.invalid");
        association.setPassword("coupon-password");
        association.setType("APS");
        return associationService.create(association);
    }

    private Activity activity(Association association, String cost) {
        Activity activity = new Activity();
        activity.setAssociationId(association.getId());
        activity.setName("Corso " + UUID.randomUUID().toString().substring(0, 6));
        activity.setCategory("COURSE");
        activity.setCost(new BigDecimal(cost));
        return activityService.save(activity);
    }

    private Event event(Association association, String memberCost, String guestCost) {
        Event event = new Event();
        event.setAssociationId(association.getId());
        event.setName("Cena " + UUID.randomUUID().toString().substring(0, 6));
        event.setType("SOCIAL");
        event.setStartDatetime(LocalDateTime.now().plusDays(2));
        event.setCostMember(new BigDecimal(memberCost));
        event.setCostNonMember(new BigDecimal(guestCost));
        return eventService.createEvent(event);
    }

    private Coupon coupon(Association association, String code, String type, String value, int maxUses) {
        Coupon coupon = new Coupon();
        coupon.setAssociationId(association.getId());
        coupon.setCode(code);
        coupon.setDiscountType(type);
        coupon.setDiscountValue(new BigDecimal(value));
        coupon.setMaxUses(maxUses);
        return couponService.save(coupon);
    }

    private User user() {
        User user = new User();
        user.setFirstName("Socio");
        user.setLastName("Coupon");
        user.setEmail("u-" + UUID.randomUUID().toString().substring(0, 8) + "@example.invalid");
        return userService.save(user);
    }
}
