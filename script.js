document.addEventListener('DOMContentLoaded', () => {
    const calculateButton = document.getElementById('calculateBtn');

    // Helper function to parse "도-분-초" string
    function parseDMS(dmsString) {
        const parts = dmsString.split('-').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) { // 모든 부분이 숫자인지 확인
            return {
                degrees: parts[0],
                minutes: parts[1],
                seconds: parts[2]
            };
        }
        return null; // 유효하지 않은 형식일 경우 null 반환
    }

    // Function to convert degrees, minutes, seconds to radians
    function dmsToRadians(degrees, minutes, seconds) {
        const totalDegrees = parseFloat(degrees) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;
        return totalDegrees * (Math.PI / 180);
    }

    // Function to calculate new coordinates (X with cos, Y with sin)
    // Assumes bearing is measured from the positive X-axis (East) counter-clockwise.
    function calculateNewCoordinate(originX, originY, bearingRadians, distance) {
        const deltaX = distance * Math.cos(bearingRadians);
        const deltaY = distance * Math.sin(bearingRadians);

        const newX = originX + deltaX;
        const newY = originY + deltaY;

        return { x: newX, y: newY };
    }

    // Function to calculate the area of a polygon using the Shoelace formula
    // Points should be an array of objects: [{x: x1, y: y1}, {x: x2, y: y2}, ...]
    function calculatePolygonArea(points) {
        let area = 0;
        const n = points.length;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n; // Next point index, wraps around to 0 for the last point
            area += (points[i].x * points[j].y);
            area -= (points[i].y * points[j].x);
        }

        return Math.abs(area / 2);
    }

    calculateButton.addEventListener('click', () => {
        // 모든 결과 값 초기화
        document.getElementById('displayAX').textContent = '';
        document.getElementById('displayAY').textContent = '';
        document.getElementById('displayPX').textContent = '';
        document.getElementById('displayPY').textContent = '';
        document.getElementById('displayBX').textContent = '';
        document.getElementById('displayBY').textContent = '';
        document.getElementById('displayQX').textContent = '';
        document.getElementById('displayQY').textContent = '';
        document.getElementById('displayArea').textContent = '';

        // 1. A점 좌표 가져오기 및 유효성 검사
        const pointAX = parseFloat(document.getElementById('pointAX').value);
        const pointAY = parseFloat(document.getElementById('pointAY').value);
        if (isNaN(pointAX) || isNaN(pointAY)) {
            alert("A점 X, Y 좌표를 올바른 숫자로 입력해주세요.");
            return;
        }

        // 2. P점 계산 (A점 기준)
        const bearingP_dms_str = document.getElementById('bearingP').value;
        const distanceP = parseFloat(document.getElementById('distanceP').value);
        const bearingP_dms = parseDMS(bearingP_dms_str);

        if (!bearingP_dms) {
            alert("P점의 방위각 형식이 올바르지 않습니다. '도-분-초' 형식으로 입력해주세요 (예: 123-45-50).");
            return;
        }
        if (isNaN(distanceP)) {
            alert("P점의 수평거리를 올바른 숫자로 입력해주세요.");
            return;
        }
        const bearingP_rad = dmsToRadians(bearingP_dms.degrees, bearingP_dms.minutes, bearingP_dms.seconds);
        const pointP = calculateNewCoordinate(pointAX, pointAY, bearingP_rad, distanceP);

        // 3. B점 계산 (A점 기준)
        const bearingB_dms_str = document.getElementById('bearingB').value;
        const distanceB = parseFloat(document.getElementById('distanceB').value);
        const bearingB_dms = parseDMS(bearingB_dms_str);

        if (!bearingB_dms) {
            alert("B점의 방위각 형식이 올바르지 않습니다. '도-분-초' 형식으로 입력해주세요 (예: 193-13-25).");
            return;
        }
        if (isNaN(distanceB)) {
            alert("B점의 수평거리를 올바른 숫자로 입력해주세요.");
            return;
        }
        const bearingB_rad = dmsToRadians(bearingB_dms.degrees, bearingB_dms.minutes, bearingB_dms.seconds);
        const pointB = calculateNewCoordinate(pointAX, pointAY, bearingB_rad, distanceB); // A점 기준!

        // 4. Q점 계산 (B점 기준)
        const bearingQ_dms_str = document.getElementById('bearingQ').value;
        const distanceQ = parseFloat(document.getElementById('distanceQ').value);
        const bearingQ_dms = parseDMS(bearingQ_dms_str);

        if (!bearingQ_dms) {
            alert("Q점의 방위각 형식이 올바르지 않습니다. '도-분-초' 형식으로 입력해주세요 (예: 85-46-12).");
            return;
        }
        if (isNaN(distanceQ)) {
            alert("Q점의 수평거리를 올바른 숫자로 입력해주세요.");
            return;
        }
        const bearingQ_rad = dmsToRadians(bearingQ_dms.degrees, bearingQ_dms.minutes, bearingQ_dms.seconds);
        const pointQ = calculateNewCoordinate(pointB.x, pointB.y, bearingQ_rad, distanceQ);

        // 5. 결과 표시
        document.getElementById('displayAX').textContent = pointAX.toFixed(4);
        document.getElementById('displayAY').textContent = pointAY.toFixed(4);
        document.getElementById('displayPX').textContent = pointP.x.toFixed(4);
        document.getElementById('displayPY').textContent = pointP.y.toFixed(4);
        document.getElementById('displayBX').textContent = pointB.x.toFixed(4);
        document.getElementById('displayBY').textContent = pointB.y.toFixed(4);
        document.getElementById('displayQX').textContent = pointQ.x.toFixed(4);
        document.getElementById('displayQY').textContent = pointQ.y.toFixed(4);

        // 6. 면적 계산 및 표시 (P, A, B, Q 순서)
        const polygonPoints = [
            { x: pointP.x, y: pointP.y },
            { x: pointAX, y: pointAY }, // A점
            { x: pointB.x, y: pointB.y },
            { x: pointQ.x, y: pointQ.y }
        ];
        const area = calculatePolygonArea(polygonPoints);
        document.getElementById('displayArea').textContent = area.toFixed(3); // 면적을 소수점 셋째 자리까지 표시하도록 수정
    });
});