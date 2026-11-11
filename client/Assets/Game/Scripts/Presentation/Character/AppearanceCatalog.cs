using System;
using System.Collections.Generic;
using UnityEngine;

namespace MyDigitalExistence.Presentation
{
    public enum VisualSlot { Body, Torso, Hair, HeldMain }

    [Serializable]
    public struct VisualFrame
    {
        [SerializeField] private Sprite _sprite;
        [SerializeField] private int _order;

        public Sprite Sprite => _sprite;
        public int Order => _order;
    }

    [Serializable]
    public sealed class AppearancePart
    {
        [SerializeField] private string _id;
        [SerializeField] private string _displayName;
        [SerializeField] private VisualSlot _slot;
        [SerializeField] private string _archetypeId;
        [SerializeField] private string _bodyId;
        [SerializeField] private VisualFrame[] _frames;

        public string Id => _id;
        public string DisplayName => _displayName;
        public VisualSlot Slot => _slot;
        public IReadOnlyList<VisualFrame> Frames => _frames;

        public bool Fits(string archetypeId, string bodyId)
        {
            return _archetypeId == archetypeId && _bodyId == bodyId;
        }
    }

    [CreateAssetMenu(menuName = "myDigitalExistence/Appearance Catalog")]
    public sealed class AppearanceCatalog : ScriptableObject
    {
        [SerializeField] private int _version = 1;
        [SerializeField] private string _status = "CANDIDATO_JOGAVEL";
        [SerializeField] private string _archetypeId;
        [SerializeField] private string _bodyId;
        [SerializeField] private int _idleFrames = 4;
        [SerializeField] private int _reactionFrames = 3;
        [SerializeField] private float _idleFrameSeconds = 0.24f;
        [SerializeField] private float _reactionFrameSeconds = 0.12f;
        [SerializeField] private AppearancePart[] _parts;

        public int Version => _version;
        public string Status => _status;
        public string ArchetypeId => _archetypeId;
        public string BodyId => _bodyId;
        public int IdleFrames => _idleFrames;
        public int ReactionFrames => _reactionFrames;
        public float IdleFrameSeconds => _idleFrameSeconds;
        public float ReactionFrameSeconds => _reactionFrameSeconds;
        public IReadOnlyList<AppearancePart> Parts => _parts;

        public AppearancePart Find(string id)
        {
            foreach (AppearancePart part in _parts)
            {
                if (part.Id == id)
                {
                    return part;
                }
            }
            return null;
        }

        public AppearancePart Next(VisualSlot slot, AppearancePart current)
        {
            AppearancePart first = null;
            bool foundCurrent = current == null;
            foreach (AppearancePart part in _parts)
            {
                if (part.Slot != slot || !part.Fits(_archetypeId, _bodyId))
                {
                    continue;
                }

                first ??= part;
                if (foundCurrent)
                {
                    return part;
                }
                foundCurrent = part == current;
            }

            return slot == VisualSlot.HeldMain ? null : first;
        }
    }
}
