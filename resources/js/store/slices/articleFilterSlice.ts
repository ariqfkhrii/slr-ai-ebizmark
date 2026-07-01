// src/store/slices/articleFilterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  page: number;
  size: number;
  search: string;
  included: boolean | undefined;
  yearFrom: number | undefined;
  yearTo: number | undefined;
  selectedTiers: string[];
}

interface ArticleFilterState {
  'per-keyword': FilterState;
  'all-keywords': FilterState;
}

const initialState: ArticleFilterState = {
  'per-keyword': {
    page: 1,
    size: 10,
    search: '',
    included: undefined,
    yearFrom: undefined,
    yearTo: undefined,
    selectedTiers: [],
  },
  'all-keywords': {
    page: 1,
    size: 10,
    search: '',
    included: undefined,
    yearFrom: undefined,
    yearTo: undefined,
    selectedTiers: [],
  },
};

const articleFilterSlice = createSlice({
  name: 'articleFilter',
  initialState,
  reducers: {
    setPage: (
      state,
      action: PayloadAction<{
        tab: 'per-keyword' | 'all-keywords';
        page: number;
      }>,
    ) => {
      const { tab, page } = action.payload;
      state[tab].page = page;
    },
    setSize: (
      state,
      action: PayloadAction<{
        tab: 'per-keyword' | 'all-keywords';
        size: number;
      }>,
    ) => {
      const { tab, size } = action.payload;
      state[tab].size = size;
    },
    setSearch: (
      state,
      action: PayloadAction<{
        tab: 'per-keyword' | 'all-keywords';
        search: string;
      }>,
    ) => {
      const { tab, search } = action.payload;
      state[tab].search = search;
      state[tab].page = 1;
    },
    setIncluded: (
      state,
      action: PayloadAction<{
        tab: 'per-keyword' | 'all-keywords';
        included: boolean | undefined;
      }>,
    ) => {
      const { tab, included } = action.payload;
      state[tab].included = included;
      state[tab].page = 1;
    },
    setYearFrom: (
      state,
      action: PayloadAction<{
        tab: 'per-keyword' | 'all-keywords';
        yearFrom: number | undefined;
      }>,
    ) => {
      const { tab, yearFrom } = action.payload;
      state[tab].yearFrom = yearFrom;
      state[tab].page = 1;
    },
    setYearTo: (
      state,
      action: PayloadAction<{
        tab: 'per-keyword' | 'all-keywords';
        yearTo: number | undefined;
      }>,
    ) => {
      const { tab, yearTo } = action.payload;
      state[tab].yearTo = yearTo;
      state[tab].page = 1;
    },
    setSelectedTiers: (
      state,
      action: PayloadAction<{
        tab: 'per-keyword' | 'all-keywords';
        tiers: string[];
      }>,
    ) => {
      const { tab, tiers } = action.payload;
      state[tab].selectedTiers = tiers;
      state[tab].page = 1;
    },
    resetFilters: (
      state,
      action: PayloadAction<{ tab: 'per-keyword' | 'all-keywords' }>,
    ) => {
      const { tab } = action.payload;
      state[tab] = {
        page: 1,
        size: 10,
        search: '',
        included: undefined,
        yearFrom: undefined,
        yearTo: undefined,
        selectedTiers: [],
      };
    },
  },
});

export const {
  setPage,
  setSize,
  setSearch,
  setIncluded,
  setYearFrom,
  setYearTo,
  setSelectedTiers,
  resetFilters,
} = articleFilterSlice.actions;

export default articleFilterSlice.reducer;
