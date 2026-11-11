using System.Collections.Generic;
using MyDigitalExistence.Presentation;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;

namespace MyDigitalExistence.Tests
{
    public sealed class PrototypeAppearanceTests
    {
        private AppearanceCatalog _catalog;

        [SetUp]
        public void LoadCatalog()
        {
            _catalog = AssetDatabase.LoadAssetAtPath<AppearanceCatalog>("Assets/Game/Content/PrototypeAppearance.asset");
            Assert.That(_catalog, Is.Not.Null);
        }

        [Test]
        public void CatalogHasUniqueIdsAndAlignedFramesForEveryPart()
        {
            var ids = new HashSet<string>();
            int frameCount = _catalog.IdleFrames + _catalog.ReactionFrames;
            Assert.That(_catalog.Version, Is.Positive);
            Assert.That(_catalog.Status, Is.EqualTo("CANDIDATO_JOGAVEL"));
            Assert.That(_catalog.Parts.Count, Is.EqualTo(7));

            foreach (AppearancePart part in _catalog.Parts)
            {
                Assert.That(part.Id, Does.Match("^[a-z][a-z0-9_]*$"));
                Assert.That(ids.Add(part.Id), Is.True, part.Id);
                Assert.That(part.Fits(_catalog.ArchetypeId, _catalog.BodyId), Is.True, part.Id);
                Assert.That(part.Frames.Count, Is.EqualTo(frameCount), part.Id);

                foreach (VisualFrame frame in part.Frames)
                {
                    Sprite sprite = frame.Sprite;
                    Assert.That(sprite, Is.Not.Null, part.Id);
                    Assert.That(sprite.rect.size, Is.EqualTo(new Vector2(96, 128)), sprite.name);
                    Assert.That(sprite.pivot, Is.EqualTo(new Vector2(48, 11)), sprite.name);
                    Assert.That(sprite.pixelsPerUnit, Is.EqualTo(32), sprite.name);
                    Assert.That(sprite.texture.filterMode, Is.EqualTo(FilterMode.Point), sprite.name);
                }
            }
        }

        [Test]
        public void PrefabKeepsItsCatalogAndEachLayerReference()
        {
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Game/Prefabs/PrototypeHumanoid.prefab");
            Assert.That(prefab, Is.Not.Null);
            var character = prefab.GetComponent<ModularCharacter>();
            Assert.That(character, Is.Not.Null);
            var data = new SerializedObject(character);
            Assert.That(data.FindProperty("_catalog").objectReferenceValue, Is.EqualTo(_catalog));

            var layers = data.FindProperty("_layers");
            Assert.That(layers.arraySize, Is.EqualTo(4));
            for (int i = 0; i < layers.arraySize; i++)
            {
                var layer = layers.GetArrayElementAtIndex(i);
                string initialId = layer.FindPropertyRelative("InitialPartId").stringValue;
                Assert.That(_catalog.Find(initialId), Is.Not.Null, initialId);
                Assert.That(layer.FindPropertyRelative("Renderer").objectReferenceValue, Is.Not.Null, initialId);
            }
        }

        [Test]
        public void EquipmentCyclesThroughTwoItemsAndAnEmptyHand()
        {
            AppearancePart blade = _catalog.Next(VisualSlot.HeldMain, null);
            AppearancePart staff = _catalog.Next(VisualSlot.HeldMain, blade);
            Assert.That(blade.Id, Is.EqualTo("wpn_ashwood_practice_blade"));
            Assert.That(staff.Id, Is.EqualTo("wpn_woven_staff"));
            Assert.That(_catalog.Next(VisualSlot.HeldMain, staff), Is.Null);
            Assert.That(blade.Fits(_catalog.ArchetypeId, "body_other"), Is.False);
        }
    }
}
