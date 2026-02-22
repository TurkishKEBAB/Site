"""
Contact Messages Endpoint Tests
Test contact form submission and admin message management.
"""


def test_submit_contact_message_success(client):
    """Test successful contact message submission."""
    response = client.post(
        '/api/v1/contact/',
        json={
            'name': 'John Doe',
            'email': 'john@example.com',
            'subject': 'Test Subject',
            'message': 'This is a test message',
        },
    )

    assert response.status_code == 201
    data = response.json()

    assert data['success'] is True
    assert data['message'] == 'Your message has been sent successfully.'
    assert 'message_id' in data


def test_submit_contact_message_validation(client):
    """Test contact message validation."""
    response = client.post(
        '/api/v1/contact/',
        json={
            'name': '',
            'email': 'invalid-email',
            'message': '',
        },
    )

    assert response.status_code == 422


def test_get_messages_unauthorized(client):
    """Test that getting messages requires authentication."""
    response = client.get('/api/v1/contact/')

    assert response.status_code == 401


def test_get_messages_forbidden_regular_user(client, user_headers):
    """Test that getting messages is forbidden for regular users."""
    response = client.get('/api/v1/contact/', headers=user_headers)

    assert response.status_code == 403


def test_get_messages_success(client, admin_headers, db_session):
    """Test successful messages retrieval by admin."""
    from app.models.contact import ContactMessage

    message1 = ContactMessage(
        name='User 1',
        email='user1@example.com',
        subject='Subject 1',
        message='Message 1',
        is_read=False,
    )
    message2 = ContactMessage(
        name='User 2',
        email='user2@example.com',
        subject='Subject 2',
        message='Message 2',
        is_read=True,
    )
    db_session.add_all([message1, message2])
    db_session.commit()

    response = client.get('/api/v1/contact/', headers=admin_headers)

    assert response.status_code == 200
    data = response.json()

    assert data['total'] == 2
    assert data['skip'] == 0
    assert data['limit'] == 20
    assert len(data['messages']) == 2
    assert {item['name'] for item in data['messages']} == {'User 1', 'User 2'}


def test_get_unread_messages_only(client, admin_headers, db_session):
    """Test filtering for unread messages only."""
    from app.models.contact import ContactMessage

    message1 = ContactMessage(
        name='User 1',
        email='user1@example.com',
        subject='Subject 1',
        message='Message 1',
        is_read=False,
    )
    message2 = ContactMessage(
        name='User 2',
        email='user2@example.com',
        subject='Subject 2',
        message='Message 2',
        is_read=True,
    )
    db_session.add_all([message1, message2])
    db_session.commit()

    response = client.get('/api/v1/contact/?unread_only=true', headers=admin_headers)

    assert response.status_code == 200
    data = response.json()

    assert data['total'] == 1
    assert len(data['messages']) == 1
    assert data['messages'][0]['is_read'] is False


def test_mark_message_as_read(client, admin_headers, db_session):
    """Test marking a message as read."""
    from app.models.contact import ContactMessage

    message = ContactMessage(
        name='User',
        email='user@example.com',
        subject='Subject',
        message='Message',
        is_read=False,
    )
    db_session.add(message)
    db_session.commit()
    message_id = message.id

    response = client.patch(f'/api/v1/contact/{message_id}/read', headers=admin_headers)

    assert response.status_code == 200

    db_session.expire_all()
    updated_message = (
        db_session.query(ContactMessage)
        .filter(ContactMessage.id == message_id)
        .first()
    )
    assert updated_message.is_read is True


def test_delete_message_success(client, admin_headers, db_session):
    """Test successful message deletion."""
    from app.models.contact import ContactMessage

    message = ContactMessage(
        name='User',
        email='user@example.com',
        subject='Subject',
        message='Message',
        is_read=False,
    )
    db_session.add(message)
    db_session.commit()
    message_id = message.id

    response = client.delete(f'/api/v1/contact/{message_id}', headers=admin_headers)

    assert response.status_code == 204

    db_session.expire_all()
    deleted_message = (
        db_session.query(ContactMessage)
        .filter(ContactMessage.id == message_id)
        .first()
    )
    assert deleted_message is None


def test_get_unread_count(client, admin_headers, db_session):
    """Test getting unread message count."""
    from app.models.contact import ContactMessage

    message1 = ContactMessage(
        name='User 1',
        email='user1@example.com',
        subject='Subject 1',
        message='Message 1',
        is_read=False,
    )
    message2 = ContactMessage(
        name='User 2',
        email='user2@example.com',
        subject='Subject 2',
        message='Message 2',
        is_read=False,
    )
    message3 = ContactMessage(
        name='User 3',
        email='user3@example.com',
        subject='Subject 3',
        message='Message 3',
        is_read=True,
    )
    db_session.add_all([message1, message2, message3])
    db_session.commit()

    response = client.get('/api/v1/contact/unread-count', headers=admin_headers)

    assert response.status_code == 200
    data = response.json()

    assert data['unread_count'] == 2
