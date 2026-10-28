-- Coupons applied at registration: the coupon, its discount and the amount due are kept on the participant.
ALTER TABLE `activity_participants` ADD COLUMN `coupon_id` bigint, ADD COLUMN `amount_due` decimal(38,2);
ALTER TABLE `activity_participants` ADD CONSTRAINT `fk_activity_participants_coupon_id` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL;

ALTER TABLE `event_participants` ADD COLUMN `coupon_id` bigint, ADD COLUMN `coupon_code` varchar(255),
    ADD COLUMN `original_amount` decimal(38,2), ADD COLUMN `discount_amount` decimal(38,2), ADD COLUMN `amount_due` decimal(38,2);
ALTER TABLE `event_participants` ADD CONSTRAINT `fk_event_participants_coupon_id` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL;
