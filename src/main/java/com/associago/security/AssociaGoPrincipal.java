package com.associago.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;
import java.util.Objects;

public class AssociaGoPrincipal implements OAuth2User {

    private final OAuth2User delegate;
    private final Long localUserId;

    public AssociaGoPrincipal(OAuth2User delegate, Long localUserId) {
        this.delegate = Objects.requireNonNull(delegate, "delegate");
        this.localUserId = Objects.requireNonNull(localUserId, "localUserId");
    }

    public Long getLocalUserId() {
        return localUserId;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return delegate.getAuthorities();
    }

    @Override
    public String getName() {
        return delegate.getName();
    }
}
