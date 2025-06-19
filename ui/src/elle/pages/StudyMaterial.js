import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import ContentCard from '../components/library/shared/ContentCard';
import AddStudyMaterialButton from '../components/library/studymaterial/AddStudyMaterialButton';
import AddStudyMaterial from '../components/library/studymaterial/AddStudyMaterial';
import StudyMaterialPopup from '../components/library/studymaterial/StudyMaterialPopup';
import SearchBar from '../components/library/search/SearchBar';
import LibraryNavbar from '../components/library/shared/LibraryNavbar';
import CategoryFilters from '../components/library/search/CategoryFilters';
import TypeFilters from '../components/library/search/TypeFilters';
import LanguageFilters from '../components/library/search/LanguageFilters';
import SortButton from '../components/library/search/SortButton';
import Pagination from '../components/library/shared/Pagination';
import usePagination from '../hooks/library/usePagination';
import './styles/Home.css';
import './styles/Library.css';
import { ElleOuterDivStyle } from '../const/StyleConstants';
import { useTranslation } from 'react-i18next';
import Can from '../components/security/Can';

export default function StudyMaterial() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const openId = searchParams.get('open');

  const [modalOpen, setModalOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [sortOption, setSortOption] = useState('newest');

  const materialsPerPage = 5;
  const { t } = useTranslation();

  const {
    currentPage,
    totalPages,
    currentItems: currentMaterials,
    goToPrev: prev,
    goToNext: next,
    setCurrentPage
  } = usePagination(materials, materialsPerPage);

  const applySort = (data, option) => {
    switch (option) {
      case 'az':
        return [...data].sort((a, b) => a.title.localeCompare(b.title));
      case 'za':
        return [...data].sort((a, b) => b.title.localeCompare(a.title));
      case 'oldest':
        return [...data].sort((a, b) => a.id - b.id);
      case 'newest':
      default:
        return [...data].sort((a, b) => b.id - a.id);
    }
  };

  const fetchData = () => {
    const params = new URLSearchParams();
    if (selectedCategories.length) {
      params.append('categories', selectedCategories.join(','));
    }
    if (selectedLanguages.length) {
      params.append('languageLevel', selectedLanguages.join(','));
    }
    if (selectedTypes.length) {
      params.append('materialType', selectedTypes.join(','));
    }

    fetch(`http://localhost:9090/api/study-material/results?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('HTTP error ' + res.status);
        return res.json();
      })
      .then(json => {
        setMaterials(applySort(json, sortOption));
        setCurrentPage(1);
      })
      .catch(err => {
        console.error(err);
        setMaterials([]);
      });
  };

  const handleSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      fetchData();
      return;
    }

    try {
      const url = `http://localhost:9090/api/study-material/search?query=${encodeURIComponent(trimmed)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setMaterials(applySort(data, 'newest'));
      setSortOption('newest');
      setCurrentPage(1);
    } catch (err) {
      console.error('Search error:', err);
      setMaterials([]);
    }
  };

  const handleCardClick = (material) => {
    setSelectedMaterial(material);
    setPopupOpen(true);
    const newSearch = new URLSearchParams(location.search);
    newSearch.set('open', material.id);
    navigate(`${location.pathname}?${newSearch.toString()}`, { replace: true });
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedMaterial(null);
    const newSearch = new URLSearchParams(location.search);
    newSearch.delete('open');
    navigate(`${location.pathname}?${newSearch.toString()}`, { replace: true });
  };

  const handleSortChange = (option) => {
    const sorted = applySort(materials, option);
    setMaterials(sorted);
    setSortOption(option);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategories, selectedLanguages, selectedTypes]);

  useEffect(() => {
    if (openId && materials.length > 0) {
      const match = materials.find(m => m.id === parseInt(openId));
      if (match) {
        setSelectedMaterial(match);
        setPopupOpen(true);
      }
    }
  }, [openId, materials]);

  return (
    <div>
      <AddStudyMaterial
        isOpen={modalOpen}
        setIsOpen={() => setModalOpen(false)}
        onSubmitSuccess={async (newMaterial) => {
          try {
            const url = `http://localhost:9090/api/study-material/${newMaterial.id}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Fetch error');
            const fullMaterial = await res.json();
            setMaterials(prev => [fullMaterial, ...prev]);
            setCurrentPage(1);
          } catch {
            setMaterials(prev => [newMaterial, ...prev]);
            setCurrentPage(1);
          }
        }}
      />
      <StudyMaterialPopup open={popupOpen} onClose={handleClosePopup} material={selectedMaterial} />
      <Box className="adding-rounded-corners" sx={ElleOuterDivStyle}>
        <Box className="library-container">
          <h1 className="library-page-title">{t('study_materials')}</h1>
          <div className="library-main-content">
            <div className="library-filters">
              <div className="library-navbar-section">
                <LibraryNavbar />
              </div>
              <div className="library-filters-section">
                <CategoryFilters selected={selectedCategories} onChange={setSelectedCategories} />
                <br />
                <LanguageFilters selected={selectedLanguages} onChange={setSelectedLanguages} />
                <br />
                <TypeFilters selected={selectedTypes} onChange={setSelectedTypes} />
              </div>
            </div>

            <div className="library-infoContainer">
              <SearchBar onSearch={handleSearch} />
              <div className="library-header-actions">
                <Can requireAuth={true}>
                  <AddStudyMaterialButton onClick={() => setModalOpen(true)} />
                </Can>
                <SortButton selected={sortOption} onChange={handleSortChange} />
              </div>
              <div className="library-results-count">
                <Box>{t('query_found') + ':'} {materials.length}</Box>
              </div>
              <div className="library-results">
                {materials.length === 0 ? (
                  <Box sx={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '2rem' }}>
                    {t('Tulemusi ei leitud')}
                  </Box>
                ) : (
                  currentMaterials.map(m => (
                    <ContentCard key={m.id} item={m} type="material" onClick={() => handleCardClick(m)} />
                  ))
                )}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={prev}
                onNext={next}
              />
            </div>
          </div>
        </Box>
      </Box>
    </div>
  );
}
