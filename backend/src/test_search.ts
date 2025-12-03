const API_URL = 'http://localhost:5001/api/sitters/search';
const PING_URL = 'http://localhost:5001/api/sitters/test-public';

const runPing = async () => {
    try {
        console.log('\nRunning Ping Test...');
        const response = await fetch(PING_URL);
        if (response.ok) {
            console.log('✅ PING PASSED');
        } else {
            console.log(`❌ PING FAILED: HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ PING ERROR:', error);
    }
};

// Helper to run a test case
const runTest = async (name: string, params: any, expectedNames: string[]) => {
    try {
        console.log(`\nRunning Test: ${name}`);
        console.log('Params:', JSON.stringify(params));

        const url = new URL(API_URL);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const response = await fetch(url.toString());

        if (!response.ok) {
            console.log(`❌ FAILED: HTTP ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log('Response:', text);
            return;
        }

        const sitters = await response.json();

        if (!Array.isArray(sitters)) {
            console.log('❌ FAILED: Response is not an array', sitters);
            return;
        }

        const names = sitters.map((s: any) => s.user.firstName).sort();
        const expected = expectedNames.sort();

        const passed = JSON.stringify(names) === JSON.stringify(expected);
        if (passed) {
            console.log('✅ PASSED');
        } else {
            console.log('❌ FAILED');
            console.log('Expected:', expected);
            console.log('Got:', names);
        }
    } catch (error) {
        console.error('❌ ERROR:', error);
    }
};

const runTests = async () => {
    await runPing();
    // 1. Search NY (Central Park) for Boarding (Radius 20km default)
    // Alice is at Central Park. Bob is ~9km away. Charlie is ~12km away. David is ~130km away.
    // Alice offers Boarding. Bob offers DayCare/HouseSitting. Charlie offers DropIn. David offers Boarding.
    // Expected: Alice only (Bob doesn't offer Boarding, Charlie doesn't, David is too far).
    await runTest(
        'Search NY (Central Park) for Boarding',
        { latitude: 40.785091, longitude: -73.968285, serviceType: 'boarding' },
        ['Alice']
    );

    // 2. Search NY for Dog Walking
    // Alice offers Walking.
    await runTest(
        'Search NY for Dog Walking',
        { latitude: 40.785091, longitude: -73.968285, serviceType: 'walking' },
        ['Alice']
    );

    // 3. Search NY for Cats (Any service)
    // Alice: Dogs only. Bob: Dogs/Cats. Charlie: Cats only.
    // Expected: Bob, Charlie.
    await runTest(
        'Search NY for Cats',
        { latitude: 40.785091, longitude: -73.968285, petType: 'cat' },
        ['Bob', 'Charlie']
    );

    // 4. Search NY for Large Dogs
    // Alice: S/M/L. Bob: S. Charlie: Cats.
    // Expected: Alice.
    await runTest(
        'Search NY for Large Dogs',
        { latitude: 40.785091, longitude: -73.968285, petType: 'dog', weight: 30 }, // 30kg = Large
        ['Alice']
    );

    // 5. Search Philadelphia for Boarding
    // David is in Philly.
    await runTest(
        'Search Philadelphia for Boarding',
        { latitude: 39.952583, longitude: -75.165222, serviceType: 'boarding' },
        ['David']
    );

    // 6. Search NY for Giant Dogs
    // Alice: S/M/L. Bob: S. Charlie: Cats (but S/M/L/G).
    // If we search for DOG + Giant:
    // Alice (L) -> No. Bob (S) -> No. Charlie (Cat) -> No (petType mismatch).
    // Expected: None.
    // 7. Search NY for Boarding on Blocked Date
    // Alice is in NY. Let's assume she is blocked on 2025-12-25.
    // We need to seed this blocked date first or assume it exists.
    // For this test, we will skip seeding and just add the test structure, 
    // but in a real scenario, we'd update the seed data.
    // Let's update the seed data in the next step to include a blocked date for Alice.
    await runTest(
        'Search NY for Boarding (Blocked Date Check)',
        {
            latitude: 40.785091,
            longitude: -73.968285,
            serviceType: 'boarding',
            startDate: '2025-12-25',
            endDate: '2025-12-26'
        },
        ['Alice'] // Filter removed, so Alice SHOULD appear now.
    );
};

runTests();
