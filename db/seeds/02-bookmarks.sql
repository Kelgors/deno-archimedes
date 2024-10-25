INSERT INTO bookmarks (id, name, description, url)
VALUES
    (
        '3a543337-0989-400b-9d39-c2f02270a299',
        'DuckDuckGo',
        'The Internet privacy company that empowers you to seamlessly take control of your personal information online, without any tradeoffs.',
        'https://duckduckgo.com/'
    ),
    (
        '7abd6fbd-dc99-40b8-a404-efe6ae8a51f0',
        'Qwant',
        'The search engine that values you as a user, not as a product',
        'https://www.qwant.com/'
    ),
    (
        '99943bac-567a-4bee-ba4d-fc72fed4c26b',
        'Google',
        '',
        'https://www.google.com/'
    ),
    (
        '96bd0559-5a64-4d57-b702-c9b7f6c6ba3d',
        'Bing',
        '',
        'https://www.bing.com/'
    ),
    (
        '1227de09-0806-488e-8e8e-c366b16b1638',
        'Caramail',
        '',
        'https://www.caramail.com/'
    );

INSERT INTO bookmark_users (user_id, bookmark_id)
VALUES
    (
        '67558dc7-15a9-4ec7-baa4-43610a81d17a',
        '3a543337-0989-400b-9d39-c2f02270a299'
    ),
    (
        '67558dc7-15a9-4ec7-baa4-43610a81d17a',
        '7abd6fbd-dc99-40b8-a404-efe6ae8a51f0'
    ),
    (
        '67558dc7-15a9-4ec7-baa4-43610a81d17a',
        '99943bac-567a-4bee-ba4d-fc72fed4c26b'
    ),
    (
        '67558dc7-15a9-4ec7-baa4-43610a81d17a',
        '96bd0559-5a64-4d57-b702-c9b7f6c6ba3d'
    ),
    (
        '492fb24a-d6a4-4fd9-96b6-0ec6ab0d7d9b',
        '1227de09-0806-488e-8e8e-c366b16b1638'
    );
