"use client";
import React from "react";
import ReactPaginate from "react-paginate";
import css from "./Pagination.module.css";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <nav className={css.container} aria-label="Pagination">
      <ReactPaginate
        pageCount={totalPages}
        forcePage={currentPage - 1}
        onPageChange={(selected) => onPageChange(selected.selected + 1)}
        marginPagesDisplayed={1}
        pageRangeDisplayed={3}
        previousLabel="«"
        nextLabel="»"
        breakLabel="..."
        containerClassName={css.pagination}
        pageClassName={css.page}
        activeClassName={css.active}
        previousClassName={css.prev}
        nextClassName={css.next}
        disabledClassName={css.disabled}
      />
    </nav>
  );
};

export default Pagination;
