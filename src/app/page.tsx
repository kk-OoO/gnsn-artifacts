'use client';

import React, { useState, useEffect } from 'react';
import { Artifact, Character } from '@/types/genshin';
import { CHARACTERS } from '@/data/characters';
import {
  loadStoredArtifacts,
  saveStoredArtifacts,
  resetToSampleData,
} from '@/utils/storage';
import { Header, ActiveTab } from '@/components/Header';
import { ArtifactList } from '@/components/ArtifactList';
import { CharacterRecommendList } from '@/components/CharacterRecommendList';
import { EquipSimulator } from '@/components/EquipSimulator';
import { ArtifactFormModal } from '@/components/ArtifactFormModal';

export default function Home() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [characters, setCharacters] = useState<Character[]>(CHARACTERS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('equip');
  const [selectedCharacterId, setSelectedCharacterId] =
    useState<string>('neuvillette');

  // モーダル管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);

  // 初期ロード
  useEffect(() => {
    const loaded = loadStoredArtifacts();
    setArtifacts(loaded);
  }, []);

  // 聖遺物更新
  const handleUpdateArtifacts = (newArtifacts: Artifact[]) => {
    setArtifacts(newArtifacts);
    saveStoredArtifacts(newArtifacts);
  };

  // 聖遺物の追加/編集保存
  const handleSaveArtifact = (artifact: Artifact) => {
    const exists = artifacts.some((a) => a.id === artifact.id);
    let updated: Artifact[];
    if (exists) {
      updated = artifacts.map((a) => (a.id === artifact.id ? artifact : a));
    } else {
      updated = [artifact, ...artifacts];
    }
    handleUpdateArtifacts(updated);
  };

  // 聖遺物削除
  const handleDeleteArtifact = (id: string) => {
    const updated = artifacts.filter((a) => a.id !== id);
    handleUpdateArtifacts(updated);
  };

  // 聖遺物新規作成
  const handleAddNew = () => {
    setEditingArtifact(null);
    setIsModalOpen(true);
  };

  // 聖遺物編集
  const handleEdit = (artifact: Artifact) => {
    setEditingArtifact(artifact);
    setIsModalOpen(true);
  };

  // キャラ推奨一覧から「装備シミュレーション」へ移動
  const handleSelectCharacterForEquip = (charId: string) => {
    setSelectedCharacterId(charId);
    setActiveTab('equip');
  };

  // データリセット
  const handleResetData = () => {
    const sample = resetToSampleData();
    setArtifacts(sample);
  };

  // JSONインポート
  const handleImportData = (imported: Artifact[]) => {
    handleUpdateArtifacts(imported);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* ナビゲーションヘッダー */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onResetData={handleResetData}
        artifacts={artifacts}
        onImportData={handleImportData}
      />

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'equip' && (
          <EquipSimulator
            characters={characters}
            selectedCharacterId={selectedCharacterId}
            onSelectCharacter={setSelectedCharacterId}
            artifacts={artifacts}
            onUpdateArtifacts={handleUpdateArtifacts}
          />
        )}

        {activeTab === 'manage' && (
          <ArtifactList
            artifacts={artifacts}
            characters={characters}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDeleteArtifact}
          />
        )}

        {activeTab === 'recommend' && (
          <CharacterRecommendList
            characters={characters}
            onSelectCharacterForEquip={handleSelectCharacterForEquip}
          />
        )}
      </main>

      {/* 聖遺物追加・編集モーダル */}
      <ArtifactFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingArtifact(null);
        }}
        onSave={handleSaveArtifact}
        editingArtifact={editingArtifact}
        characters={characters}
      />
    </div>
  );
}
