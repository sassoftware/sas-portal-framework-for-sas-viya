/**
 * A function that checks a string for being a valid variable name in DS2:
 * - https://go.documentation.sas.com/doc/en/pgmsascdc/default/ds2pg/p0jpu8qhzm0om9n1gy85ydkzubpf.htm
 * - https://go.documentation.sas.com/doc/en/pgmsascdc/default/ds2pg/p1rnsddd78roken1tlwnfk4poavl.htm
 * @param {String} name - Potential name of the variable
 * @returns {Boolean} - True if a valid name, False if an invalid name
 */
function isValidDS2VariableName(name) {
    // Check the general pattern: starts with a letter or underscore, followed by letters, digits, or underscores
    const identifierPattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
    if (!identifierPattern.test(name)) {
        return false;
    }

    // Check the length of the pattern
    if (name.length > 255) {
        return false;
    }

  // Reserved keywords (converted to lowercase for case-insensitive check)
    const reservedKeywords = new Set([
        "___kplist", "_all_", "_hostname_", "_new_", "_localnthreads_", "_localthreadid_", "_nthreads_",
        "_null_", "_rc_", "_rowset_", "_temporary_", "_threadid_", "abort", "and", "as", "asm",
        "bigint", "binary", "by", "call", "catalog", "char", "character", "commit", "continue",
        "data", "date", "dcl", "decimal", "declare", "delete", "descending", "dim", "do", "double",
        "drop", "ds2_options", "elif", "else", "end", "enddata", "endmodule", "endpackage",
        "endstage", "endtable", "endthread", "eq", "error", "escape", "float", "format", "fortran",
        "forward", "from", "function", "ge", "global", "goto", "group", "gt", "having", "identity",
        "if", "in", "indsname", "indsnum", "informat", "inline", "input", "int", "integer", "in_out",
        "keep", "label", "le", "leave", "like", "list", "lt", "merge", "method", "missing", "modify",
        "module", "national", "nchar", "ne", "ng", "nl", "not", "null", "numeric", "nvarchar", "ods",
        "of", "or", "order", "other", "otherwise", "output", "overwrite", "package", "partition",
        "precision", "private", "program", "put", "real", "remove", "rename", "replace", "require",
        "retain", "return", "returns", "rollback", "select", "set", "smallint", "sqlsub", "stage",
        "stop", "stored", "substr", "system", "table", "then", "this", "thread", "threads", "time",
        "timestamp", "tinyint", "to", "transaction", "t_udf", "tspl_options", "until", "update",
        "vararray", "varbinary", "varchar", "varlist", "varying", "when", "where", "while"
    ]);
    return !reservedKeywords.has(name.toLowerCase());
}