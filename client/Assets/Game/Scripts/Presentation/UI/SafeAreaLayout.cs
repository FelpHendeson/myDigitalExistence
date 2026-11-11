using UnityEngine;

namespace MyDigitalExistence.Presentation
{
    internal sealed class SafeAreaLayout
    {
        private readonly RectTransform _target;
        private Rect _lastSafeArea;
        private Vector2Int _lastScreenSize;

        public SafeAreaLayout(RectTransform target)
        {
            _target = target;
        }

        public void Refresh()
        {
            var size = new Vector2Int(Screen.width, Screen.height);
            Rect safeArea = Screen.safeArea;
            if (size.x <= 0 || size.y <= 0 || (size == _lastScreenSize && safeArea == _lastSafeArea))
            {
                return;
            }

            _lastScreenSize = size;
            _lastSafeArea = safeArea;
            _target.anchorMin = new Vector2(safeArea.xMin / size.x, safeArea.yMin / size.y);
            _target.anchorMax = new Vector2(safeArea.xMax / size.x, safeArea.yMax / size.y);
        }
    }
}
