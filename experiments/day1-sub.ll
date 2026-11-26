define i64 @diff(i64 %a, i64 %b) {
  %d = sub i64 %a, %b
  ret i64 %d
}

define i128 @diff_wide(i128 %a, i128 %b) {
  %d = sub i128 %a, %b
  ret i128 %d
}
