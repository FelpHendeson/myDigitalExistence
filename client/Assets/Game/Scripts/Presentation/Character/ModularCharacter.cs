using System;
using UnityEngine;

namespace MyDigitalExistence.Presentation
{
    public sealed class ModularCharacter : MonoBehaviour
    {
        [Serializable]
        private struct Layer
        {
            public VisualSlot Slot;
            public SpriteRenderer Renderer;
            public string InitialPartId;
        }

        [SerializeField] private AppearanceCatalog _catalog;
        [SerializeField] private Layer[] _layers;

        private AppearancePart[] _equipped;
        private float _idleTime;
        private float _reactionTime;

        public int FrameIndex { get; private set; }
        public bool IsReacting { get; private set; }

        private void Awake()
        {
            _equipped = new AppearancePart[_layers.Length];
            for (int i = 0; i < _layers.Length; i++)
            {
                if (string.IsNullOrEmpty(_layers[i].InitialPartId) && _layers[i].Slot == VisualSlot.HeldMain)
                {
                    continue;
                }

                if (!TrySelect(_layers[i].Slot, _layers[i].InitialPartId))
                {
                    Debug.LogError($"Invalid initial appearance for {_layers[i].Slot}.", this);
                }
            }
            Render();
        }

        private void Update()
        {
            Advance(Time.deltaTime);
        }

        public void React()
        {
            IsReacting = true;
            _reactionTime = 0;
            ShowFrame(_catalog.IdleFrames);
        }

        public void Advance(float seconds)
        {
            if (IsReacting)
            {
                _reactionTime += seconds;
                int frame = (int)(_reactionTime / _catalog.ReactionFrameSeconds);
                if (frame < _catalog.ReactionFrames)
                {
                    ShowFrame(_catalog.IdleFrames + frame);
                    return;
                }
                seconds = Mathf.Max(0, _reactionTime - _catalog.ReactionFrames * _catalog.ReactionFrameSeconds);
                IsReacting = false;
            }

            _idleTime = Mathf.Repeat(_idleTime + seconds, _catalog.IdleFrames * _catalog.IdleFrameSeconds);
            ShowFrame((int)(_idleTime / _catalog.IdleFrameSeconds));
        }

        public AppearancePart Selected(VisualSlot slot)
        {
            return _equipped[LayerIndex(slot)];
        }

        public void Cycle(VisualSlot slot)
        {
            int index = LayerIndex(slot);
            _equipped[index] = _catalog.Next(slot, _equipped[index]);
            DrawLayer(index);
        }

        public bool TrySelect(VisualSlot slot, string partId)
        {
            AppearancePart part = _catalog.Find(partId);
            if (part == null || part.Slot != slot || !part.Fits(_catalog.ArchetypeId, _catalog.BodyId))
            {
                return false;
            }

            int index = LayerIndex(slot);
            _equipped[index] = part;
            DrawLayer(index);
            return true;
        }

        private int LayerIndex(VisualSlot slot)
        {
            for (int i = 0; i < _layers.Length; i++)
            {
                if (_layers[i].Slot == slot)
                {
                    return i;
                }
            }
            throw new ArgumentException($"No renderer configured for {slot}.", nameof(slot));
        }

        private void ShowFrame(int frame)
        {
            if (FrameIndex == frame)
            {
                return;
            }
            FrameIndex = frame;
            Render();
        }

        private void Render()
        {
            for (int i = 0; i < _layers.Length; i++)
            {
                DrawLayer(i);
            }
        }

        private void DrawLayer(int index)
        {
            AppearancePart part = _equipped[index];
            SpriteRenderer renderer = _layers[index].Renderer;
            if (part == null)
            {
                renderer.sprite = null;
                return;
            }

            VisualFrame frame = part.Frames[FrameIndex];
            renderer.sprite = frame.Sprite;
            renderer.sortingOrder = frame.Order;
        }
    }
}
